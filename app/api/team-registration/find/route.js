import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

// Verifies that the given captain_email matches the registration, and if it
// does, returns the roster_token so the client can redirect to the existing
// /team-roster/[token] page. Generic error messages avoid leaking which field
// was wrong.
export async function POST(request) {
  try {
    const body = await request.json()
    const team_registration_id = (body?.team_registration_id || "").trim()
    const captain_email = (body?.captain_email || "").trim().toLowerCase()

    if (!team_registration_id || !captain_email) {
      return NextResponse.json(
        { error: "Please select a team and enter an email." },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data: registration, error } = await supabase
      .from("team_registrations")
      .select(
        "id, captain_email, status, roster_token, roster_token_expires_at"
      )
      .eq("id", team_registration_id)
      .single()

    if (error || !registration) {
      return NextResponse.json(
        { error: "That email doesn't match the selected team." },
        { status: 404 }
      )
    }

    if (
      (registration.captain_email || "").trim().toLowerCase() !==
      captain_email
    ) {
      return NextResponse.json(
        { error: "That email doesn't match the selected team." },
        { status: 403 }
      )
    }

    if (registration.status === "roster_complete") {
      return NextResponse.json(
        {
          error:
            "This team has already submitted its roster. Contact the league to make changes.",
        },
        { status: 400 }
      )
    }

    if (registration.status === "pending_payment") {
      return NextResponse.json(
        {
          error:
            "Payment hasn't been received yet. You'll be able to enter your roster once payment is confirmed.",
        },
        { status: 400 }
      )
    }

    if (
      registration.roster_token_expires_at &&
      new Date(registration.roster_token_expires_at) < new Date()
    ) {
      return NextResponse.json(
        {
          error:
            "Your roster link has expired. Contact the league to request a new one.",
        },
        { status: 410 }
      )
    }

    if (!registration.roster_token) {
      return NextResponse.json(
        { error: "No roster link is available for this team." },
        { status: 500 }
      )
    }

    return NextResponse.json({ roster_token: registration.roster_token })
  } catch (error) {
    console.error("Find registration error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
