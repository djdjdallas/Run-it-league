import { NextResponse } from "next/server"
import { teamRegistrations } from "../route"

export async function GET(request, { params }) {
  try {
    const { id } = params

    // Look up registration
    let registration = teamRegistrations.get(id)

    if (!registration) {
      // In demo mode, create a mock registration for the ID
      registration = {
        id,
        team_name: "Demo Team",
        primary_color: "#1E3A8A",
        secondary_color: "#F59E0B",
        captain_name: "Demo Captain",
        captain_email: "demo@example.com",
        captain_phone: null,
        status: "paid", // Assume paid for demo
        roster_token: `demo_${id}`,
        roster_token_expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        min_players: 5,
        max_players: 15,
        created_at: new Date().toISOString(),
        paid_at: new Date().toISOString(),
        roster_completed_at: null,
        team_id: null,
      }
      // Store for consistency
      teamRegistrations.set(id, registration)
      teamRegistrations.set(`token_demo_${id}`, id)
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Get registration error:", error)
    return NextResponse.json(
      { error: "Failed to get registration" },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()

    let registration = teamRegistrations.get(id)
    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      )
    }

    // Update fields
    registration = { ...registration, ...body }
    teamRegistrations.set(id, registration)

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Update registration error:", error)
    return NextResponse.json(
      { error: "Failed to update registration" },
      { status: 500 }
    )
  }
}
