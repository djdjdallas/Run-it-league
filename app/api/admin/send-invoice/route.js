import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getLeagueById } from "@/lib/leagues"
import { leaguePrefix } from "@/lib/league-path"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

export async function POST(request) {
  try {
    const { team_registration_id } = await request.json()

    if (!team_registration_id) {
      return NextResponse.json(
        { error: "Missing team_registration_id" },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Get the registration
    const { data: registration, error: regError } = await supabase
      .from("team_registrations")
      .select("*")
      .eq("id", team_registration_id)
      .single()

    if (regError || !registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      )
    }

    const stripe = getStripe()
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // Send the captain back to their own league's pages after checkout.
    // Empty for the default league, which is served from the site root.
    const base = leaguePrefix(await getLeagueById(registration.league_id))

    // Create a Stripe checkout session for the admin to send
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_TEAM_REGISTRATION_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}${base}/register/team/success?registration_id=${team_registration_id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${base}/register`,
      customer_email: registration.captain_email,
      metadata: {
        type: "team_registration",
        team_registration_id,
      },
    })

    // Update the registration status to invoice_sent
    await supabase
      .from("team_registrations")
      .update({ status: "invoice_sent" })
      .eq("id", team_registration_id)

    return NextResponse.json({
      payment_url: session.url,
      session_id: session.id,
    })
  } catch (error) {
    console.error("Send invoice error:", error)
    return NextResponse.json(
      { error: "Failed to create payment link" },
      { status: 500 }
    )
  }
}
