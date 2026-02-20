import { NextResponse } from "next/server"
import crypto from "crypto"

// In-memory storage for demo (replace with Supabase in production)
const teamRegistrations = new Map()

// Generate a secure random token
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
      logo_url,
    } = body

    // Validate required fields
    if (!team_name || !captain_name || !captain_email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Generate unique ID and roster token
    const id = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const roster_token = generateToken()
    const roster_token_expires_at = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    ).toISOString()

    const registration = {
      id,
      team_name,
      primary_color: primary_color || "#000000",
      secondary_color: secondary_color || "#FFFFFF",
      captain_name,
      captain_email,
      captain_phone: captain_phone || null,
      logo_url: logo_url || null,
      status: "pending_payment",
      roster_token,
      roster_token_expires_at,
      min_players: 5,
      max_players: 15,
      created_at: new Date().toISOString(),
      paid_at: null,
      roster_completed_at: null,
      team_id: null,
    }

    // Store registration (in production, save to Supabase)
    teamRegistrations.set(id, registration)

    // Also store by token for easy lookup
    teamRegistrations.set(`token_${roster_token}`, id)

    return NextResponse.json({
      id,
      roster_token,
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

// Export storage for use by other routes
export { teamRegistrations }
