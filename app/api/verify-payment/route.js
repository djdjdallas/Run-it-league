import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerSupabaseClient } from "@/lib/supabase-server"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

export async function POST(request) {
  try {
    const { session_id } = await request.json()

    if (!session_id) {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed", status: session.payment_status },
        { status: 400 }
      )
    }

    const { type, team_registration_id } = session.metadata || {}

    if (type !== "team_registration" || !team_registration_id) {
      return NextResponse.json(
        { error: "Invalid session metadata" },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Update registration to paid (idempotent — safe if webhook already fired)
    const { data: registration } = await supabase
      .from("team_registrations")
      .select("status")
      .eq("id", team_registration_id)
      .single()

    if (registration && registration.status !== "paid" && registration.status !== "roster_complete") {
      await supabase
        .from("team_registrations")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", team_registration_id)
    }

    return NextResponse.json({ verified: true, team_registration_id })
  } catch (error) {
    console.error("Verify payment error:", error)
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    )
  }
}
