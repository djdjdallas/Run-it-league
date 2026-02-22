import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerSupabaseClient } from "@/lib/supabase-server"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const { type, team_registration_id } = session.metadata || {}

        if (type === "team_registration" && team_registration_id) {
          const supabase = await createServerSupabaseClient()

          // Update registration status to paid
          const { error } = await supabase
            .from("team_registrations")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent,
            })
            .eq("id", team_registration_id)

          if (error) {
            console.error("Failed to update registration:", error)
          } else {
            console.log(`Registration ${team_registration_id} marked as paid`)
          }
        }
        break
      }

      case "checkout.session.expired": {
        const session = event.data.object
        const { type, team_registration_id } = session.metadata || {}

        if (type === "team_registration" && team_registration_id) {
          const supabase = await createServerSupabaseClient()

          await supabase
            .from("team_registrations")
            .update({ status: "payment_expired" })
            .eq("id", team_registration_id)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Webhook handler error:", err)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
