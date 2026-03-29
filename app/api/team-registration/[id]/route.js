import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function GET(request, { params }) {
  try {
    const { id } = params
    const supabase = await createServerSupabaseClient()

    const { data: registration, error } = await supabase
      .from("team_registrations")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Get registration error:", error)
    return NextResponse.json(
      { error: "Failed to get registration" },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const supabase = await createServerSupabaseClient()

    const { data: registration, error } = await supabase
      .from("team_registrations")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error || !registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Update registration error:", error)
    return NextResponse.json(
      { error: "Failed to update registration" },
      { status: 500 }
    )
  }
}
