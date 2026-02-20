import { NextResponse } from "next/server"
import { teamRegistrations } from "../../../team-registration/route"
import { rosterEntries, getRegistrationByToken } from "../route"

const MIN_PLAYERS = 5

// In-memory storage for created teams (demo only)
const createdTeams = new Map()
const createdPlayers = new Map()

export async function POST(request, { params }) {
  try {
    const { token } = params

    // Find registration
    let registration = getRegistrationByToken(token)

    // Demo mode handling
    if (!registration && token.startsWith("demo_")) {
      const regId = token.replace("demo_", "")
      registration = teamRegistrations.get(regId)
      if (!registration) {
        registration = {
          id: regId,
          team_name: "Demo Team",
          primary_color: "#1E3A8A",
          secondary_color: "#F59E0B",
          captain_name: "Demo Captain",
          captain_email: "demo@example.com",
          status: "paid",
          roster_token: token,
          min_players: 5,
          max_players: 15,
        }
        teamRegistrations.set(regId, registration)
      }
    }

    if (!registration) {
      return NextResponse.json(
        { error: "Invalid roster link" },
        { status: 404 }
      )
    }

    if (registration.status === "roster_complete") {
      return NextResponse.json(
        { error: "Roster has already been submitted" },
        { status: 400 }
      )
    }

    // Get players
    const players = rosterEntries.get(registration.id) || []

    // Validate minimum players
    if (players.length < MIN_PLAYERS) {
      return NextResponse.json(
        { error: `At least ${MIN_PLAYERS} players are required` },
        { status: 400 }
      )
    }

    // Create team record (in production, save to Supabase teams table)
    const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const team = {
      id: teamId,
      name: registration.team_name,
      abbreviation: registration.team_name.substring(0, 3).toUpperCase(),
      primary_color: registration.primary_color,
      secondary_color: registration.secondary_color,
      wins: 0,
      losses: 0,
      logo_url: registration.logo_url || null,
      created_at: new Date().toISOString(),
    }
    createdTeams.set(teamId, team)

    // Create player records (in production, save to Supabase players table)
    const createdPlayersList = players.map((p, index) => ({
      id: `player_${teamId}_${index}`,
      team_id: teamId,
      name: p.player_name,
      number: null,
      position: null,
      height: null,
      photo_url: p.photo_url || null,
      is_active: true,
      created_at: new Date().toISOString(),
    }))
    createdPlayers.set(teamId, createdPlayersList)

    // Update registration status
    registration.status = "roster_complete"
    registration.roster_completed_at = new Date().toISOString()
    registration.team_id = teamId
    teamRegistrations.set(registration.id, registration)

    return NextResponse.json({
      success: true,
      message: "Roster submitted successfully",
      team: {
        id: teamId,
        name: team.name,
      },
      player_count: players.length,
    })
  } catch (error) {
    console.error("Complete roster error:", error)
    return NextResponse.json(
      { error: "Failed to complete roster" },
      { status: 500 }
    )
  }
}

// Export for potential use by admin routes
export { createdTeams, createdPlayers }
