import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { withLeague } from "@/lib/league-path"

const MIN_PLAYERS = 5

export async function POST(request, { params }) {
  try {
    const { token } = params
    const supabase = await createServerSupabaseClient()

    const { data: registration, error: regError } = await supabase
      .from("team_registrations")
      .select("*")
      .eq("roster_token", token)
      .single()

    if (regError || !registration) {
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

    const { data: players, error: playersError } = await supabase
      .from("team_roster_entries")
      .select("*")
      .eq("team_registration_id", registration.id)

    if (playersError) {
      return NextResponse.json(
        { error: "Failed to get roster data" },
        { status: 500 }
      )
    }

    if (!players || players.length < MIN_PLAYERS) {
      return NextResponse.json(
        { error: `At least ${MIN_PLAYERS} players are required` },
        { status: 400 }
      )
    }

    const { data: team, error: teamError } = await supabase
      .from("teams")
      // The team inherits the league its registration was filed under.
      // Without this it would fall to the database default and a team that
      // registered for the AAPI league would be created in Run It.
      .insert(withLeague({
        name: registration.team_name,
        abbreviation: registration.team_name.substring(0, 3).toUpperCase(),
        primary_color: registration.primary_color,
        secondary_color: registration.secondary_color,
        season_id: registration.season_id || null,
      }, registration.league_id))
      .select()
      .single()

    if (teamError) {
      console.error("Create team error:", teamError)
      return NextResponse.json(
        { error: "Failed to create team" },
        { status: 500 }
      )
    }

    const playerRecords = players.map((p) =>
      withLeague(
        { team_id: team.id, name: p.player_name, is_active: true },
        registration.league_id
      )
    )

    const { error: playersInsertError } = await supabase
      .from("players")
      .insert(playerRecords)

    if (playersInsertError) {
      console.error("Create players error:", playersInsertError)
    }

    await supabase
      .from("team_registrations")
      .update({
        status: "roster_complete",
        roster_completed_at: new Date().toISOString(),
        team_id: team.id,
      })
      .eq("id", registration.id)

    return NextResponse.json({
      success: true,
      message: "Roster submitted successfully",
      team: {
        id: team.id,
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
