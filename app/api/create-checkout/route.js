import { NextResponse } from "next/server"
import Stripe from "stripe"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { type, team_registration_id, email } = body

    if (!type || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    if (type === "team_registration" && team_registration_id) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: process.env.STRIPE_TEAM_REGISTRATION_PRICE_ID,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/register/team/success?registration_id=${team_registration_id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/register/team`,
        customer_email: email,
        metadata: {
          type: "team_registration",
          team_registration_id,
        },
      })

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
      })
    }

    return NextResponse.json(
      { error: "Invalid payment type" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Payment error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
