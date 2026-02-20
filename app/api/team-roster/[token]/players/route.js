import { NextResponse } from "next/server"
import { teamRegistrations } from "../../../team-registration/route"
import { rosterEntries, getRegistrationByToken } from "../route"

const MAX_PLAYERS = 15

export async function POST(request, { params }) {
  try {
    const { token } = params
    const body = await request.json()
    const { player_name, photo_url } = body

    // Validate player name
    if (!player_name || player_name.trim().length < 2) {
      return NextResponse.json(
        { error: "Player name must be at least 2 characters" },
        { status: 400 }
      )
    }

    // Find registration
    let registration = getRegistrationByToken(token)

    // Demo mode handling
    if (!registration && token.startsWith("demo_")) {
      const regId = token.replace("demo_", "")
      registration = {
        id: regId,
        team_name: "Demo Team",
        status: "paid",
        roster_token: token,
        min_players: 5,
        max_players: 15,
      }
      teamRegistrations.set(regId, registration)
      teamRegistrations.set(`token_${token}`, regId)
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

    // Get current players
    const players = rosterEntries.get(registration.id) || []

    // Check max players
    if (players.length >= MAX_PLAYERS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PLAYERS} players allowed` },
        { status: 400 }
      )
    }

    // Create new player entry
    const newPlayer = {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      team_registration_id: registration.id,
      player_name: player_name.trim(),
      photo_url: photo_url || null,
      created_at: new Date().toISOString(),
    }

    // Add to roster
    players.push(newPlayer)
    rosterEntries.set(registration.id, players)

    return NextResponse.json(newPlayer)
  } catch (error) {
    console.error("Add player error:", error)
    return NextResponse.json(
      { error: "Failed to add player" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { token } = params
    const body = await request.json()
    const { player_id } = body

    if (!player_id) {
      return NextResponse.json(
        { error: "Player ID required" },
        { status: 400 }
      )
    }

    // Find registration
    let registration = getRegistrationByToken(token)

    // Demo mode handling
    if (!registration && token.startsWith("demo_")) {
      const regId = token.replace("demo_", "")
      registration = { id: regId, status: "paid" }
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

    // Get current players
    const players = rosterEntries.get(registration.id) || []

    // Remove player
    const filteredPlayers = players.filter((p) => p.id !== player_id)

    if (filteredPlayers.length === players.length) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      )
    }

    rosterEntries.set(registration.id, filteredPlayers)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove player error:", error)
    return NextResponse.json(
      { error: "Failed to remove player" },
      { status: 500 }
    )
  }
}
