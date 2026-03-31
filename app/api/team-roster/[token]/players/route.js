import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

const MAX_PLAYERS = 15

export async function POST(request, { params }) {
  try {
    const { token } = params
    const body = await request.json()
    const { player_name } = body

    if (!player_name || player_name.trim().length < 2) {
      return NextResponse.json(
        { error: "Player name must be at least 2 characters" },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data: registration, error: regError } = await supabase
      .from("team_registrations")
      .select("id, status")
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

    const { count } = await supabase
      .from("team_roster_entries")
      .select("id", { count: "exact", head: true })
      .eq("team_registration_id", registration.id)

    if (count >= MAX_PLAYERS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PLAYERS} players allowed` },
        { status: 400 }
      )
    }

    const { data: newPlayer, error: insertError } = await supabase
      .from("team_roster_entries")
      .insert({
        team_registration_id: registration.id,
        player_name: player_name.trim(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Insert player error:", insertError)
      return NextResponse.json(
        { error: "Failed to add player" },
        { status: 500 }
      )
    }

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

    const supabase = await createServerSupabaseClient()

    const { data: registration, error: regError } = await supabase
      .from("team_registrations")
      .select("id, status")
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

    const { error: deleteError } = await supabase
      .from("team_roster_entries")
      .delete()
      .eq("id", player_id)
      .eq("team_registration_id", registration.id)

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to remove player" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove player error:", error)
    return NextResponse.json(
      { error: "Failed to remove player" },
      { status: 500 }
    )
  }
}
