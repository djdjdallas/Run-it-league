import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { error: "Stripe checkout is no longer used. Invoices are sent manually by the admin." },
    { status: 410 }
  )
}
