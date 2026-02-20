import { NextResponse } from "next/server"
import { teamRegistrations } from "../../team-registration/route"

// In-memory storage for roster entries (replace with Supabase in production)
const rosterEntries = new Map()

function getRegistrationByToken(token) {
  // Try to find the registration ID for this token
  const regId = teamRegistrations.get(`token_${token}`)
  if (regId) {
    return teamRegistrations.get(regId)
  }

  // Check all registrations for matching token
  for (const [key, value] of teamRegistrations.entries()) {
    if (!key.startsWith("token_") && value.roster_token === token) {
      return value
    }
  }

  return null
}

export async function GET(request, { params }) {
  try {
    const { token } = params

    // Find registration by token
    let registration = getRegistrationByToken(token)

    // Demo mode: create mock registration if not found
    if (!registration) {
      if (token.startsWith("demo_")) {
        const regId = token.replace("demo_", "")
        registration = {
          id: regId,
          team_name: "Demo Team",
          primary_color: "#1E3A8A",
          secondary_color: "#F59E0B",
          captain_name: "Demo Captain",
          captain_email: "demo@example.com",
          status: "paid",
          roster_token: token,
          roster_token_expires_at: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          min_players: 5,
          max_players: 15,
        }
        teamRegistrations.set(regId, registration)
        teamRegistrations.set(`token_${token}`, regId)
      } else {
        return NextResponse.json(
          { error: "Invalid or expired roster link" },
          { status: 404 }
        )
      }
    }

    // Check if token is expired
    if (new Date(registration.roster_token_expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This roster link has expired" },
        { status: 410 }
      )
    }

    // Check registration status
    if (registration.status === "pending_payment") {
      return NextResponse.json(
        { error: "Payment not yet completed" },
        { status: 400 }
      )
    }

    if (registration.status === "roster_complete") {
      // Still allow viewing if roster is complete
    }

    // Get players for this registration
    const players = rosterEntries.get(registration.id) || []

    return NextResponse.json({
      registration: {
        id: registration.id,
        team_name: registration.team_name,
        primary_color: registration.primary_color,
        secondary_color: registration.secondary_color,
        captain_name: registration.captain_name,
        captain_email: registration.captain_email,
        status: registration.status,
        min_players: registration.min_players,
        max_players: registration.max_players,
      },
      players,
    })
  } catch (error) {
    console.error("Get roster error:", error)
    return NextResponse.json(
      { error: "Failed to get roster data" },
      { status: 500 }
    )
  }
}

// Export for use by other routes
export { rosterEntries, getRegistrationByToken }
