import { NextResponse } from "next/server"
import { teamRegistrations } from "../team-registration/route"

// This would use Stripe in production
// import Stripe from 'stripe'
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const body = await request.json()
    const { type, registration_id, team_registration_id, amount, email, description } = body

    // Validate required fields
    if (!type || !amount || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Determine success URL based on payment type
    let successUrl = "/payment/success?demo=true"
    let metadata = { type }

    if (type === "team_registration" && team_registration_id) {
      successUrl = `/register/team/success?registration_id=${team_registration_id}`
      metadata.team_registration_id = team_registration_id

      // Update registration status to paid (in demo mode)
      const registration = teamRegistrations.get(team_registration_id)
      if (registration) {
        registration.status = "paid"
        registration.paid_at = new Date().toISOString()
        teamRegistrations.set(team_registration_id, registration)
      }
    } else if (registration_id) {
      metadata.registration_id = registration_id
    }

    // In production, this would create a Stripe checkout session:
    /*
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description || 'Run It League Payment',
              description: `Payment for ${type}`,
            },
            unit_amount: Math.round(amount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}${successUrl}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      customer_email: email,
      metadata,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })
    */

    // For demo purposes, return a mock response
    return NextResponse.json({
      success: true,
      message: "Demo mode - Stripe integration ready",
      sessionId: `demo_session_${Date.now()}`,
      // In production, this would be the Stripe checkout URL
      url: successUrl,
    })
  } catch (error) {
    console.error("Payment error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
