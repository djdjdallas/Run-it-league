import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function GET(request, { params }) {
  try {
    const { token } = params
    const supabase = await createServerSupabaseClient()

    const { data: registration, error } = await supabase
      .from("team_registrations")
      .select("*")
      .eq("roster_token", token)
      .single()

    if (error || !registration) {
      return NextResponse.json(
        { error: "Invalid or expired roster link" },
        { status: 404 }
      )
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

    // Get roster entries for this registration
    const { data: players } = await supabase
      .from("team_roster_entries")
      .select("*")
      .eq("team_registration_id", registration.id)
      .order("created_at", { ascending: true })

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
      players: players || [],
    })
  } catch (error) {
    console.error("Get roster error:", error)
    return NextResponse.json(
      { error: "Failed to get roster data" },
      { status: 500 }
    )
  }
}
