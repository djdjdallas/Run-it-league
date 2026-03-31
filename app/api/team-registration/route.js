import { NextResponse } from "next/server"
import crypto from "crypto"
import { createServerSupabaseClient } from "@/lib/supabase-server"

function generateToken() {
  return crypto.randomBytes(32).toString("hex")
}

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      team_name,
      primary_color,
      secondary_color,
      captain_name,
      captain_email,
      captain_phone,
    } = body

    if (!team_name || !captain_name || !captain_email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Get current season if one exists
    const { data: season } = await supabase
      .from("seasons")
      .select("id")
      .eq("is_current", true)
      .single()

    const roster_token = generateToken()
    const roster_token_expires_at = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString()

    const { data, error } = await supabase
      .from("team_registrations")
      .insert({
        team_name,
        primary_color: primary_color || "#000000",
        secondary_color: secondary_color || "#FFFFFF",
        captain_name,
        captain_email,
        captain_phone: captain_phone || null,
        status: "pending_payment",
        roster_token,
        roster_token_expires_at,
        min_players: 5,
        max_players: 15,
        season_id: season?.id || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json(
        { error: "Failed to create registration" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: data.id,
      roster_token: data.roster_token,
      message: "Registration created successfully",
    })
  } catch (error) {
    console.error("Team registration error:", error)
    return NextResponse.json(
      { error: "Failed to create registration" },
      { status: 500 }
    )
  }
}
