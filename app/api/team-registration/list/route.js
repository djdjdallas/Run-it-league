import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

// Public list of registered teams that are still eligible for roster entry.
// Only returns non-sensitive fields. Token lookup requires the separate /find
// endpoint with captain_email verification.
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from("team_registrations")
      .select("id, team_name, primary_color, secondary_color, status, roster_token_expires_at")
      .in("status", ["invoice_sent", "paid"])
      .order("team_name", { ascending: true })

    if (error) {
      console.error("List registrations error:", error)
      return NextResponse.json(
        { error: "Failed to load teams" },
        { status: 500 }
      )
    }

    const now = Date.now()
    const eligible = (data || []).filter((r) => {
      if (!r.roster_token_expires_at) return true
      return new Date(r.roster_token_expires_at).getTime() > now
    })

    return NextResponse.json({
      teams: eligible.map((r) => ({
        id: r.id,
        team_name: r.team_name,
        primary_color: r.primary_color,
        secondary_color: r.secondary_color,
      })),
    })
  } catch (error) {
    console.error("List registrations error:", error)
    return NextResponse.json(
      { error: "Failed to load teams" },
      { status: 500 }
    )
  }
}
