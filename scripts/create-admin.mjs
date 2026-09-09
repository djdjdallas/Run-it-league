#!/usr/bin/env node
/**
 * Creates (or updates the password of) an admin login for the site.
 *
 * Why a script instead of the Supabase dashboard? Admin access here is simply
 * "has a Supabase auth user" -- see the `to authenticated` RLS policies in
 * supabase/schema.sql. So onboarding an admin means creating an auth user, and
 * doing that repeatably from the CLI beats clicking through the dashboard.
 *
 * This uses the Supabase Admin API, which requires the SERVICE ROLE key. That
 * key bypasses Row Level Security entirely, so:
 *   - keep it in .env.local (already gitignored), never in committed code
 *   - never give it a NEXT_PUBLIC_ prefix, or Next.js will ship it to browsers
 *   - it is only ever read by this script, which runs on your machine
 *
 * Usage:
 *   node scripts/create-admin.mjs <email> <password>
 *   node scripts/create-admin.mjs <email>            # prompts for the password
 *
 * Credentials are passed as arguments or typed at the prompt on purpose --
 * nothing is ever written to a file in this repo.
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"
import { createInterface } from "node:readline/promises"
import { stdin, stdout } from "node:process"

// Next.js loads .env.local automatically, but a standalone Node script does
// not, so parse it ourselves. Kept dependency-free and deliberately simple:
// KEY=value lines, optional surrounding quotes, `#` comments ignored.
function loadEnvLocal() {
  let raw
  try {
    raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
  } catch {
    return // no .env.local -- fall back to whatever is already in process.env
  }

  for (const line of raw.split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (!match) continue
    const [, key, value] = match
    // Don't clobber vars the caller set explicitly on the command line.
    if (process.env[key] === undefined) {
      process.env[key] = value.replace(/^["']|["']$/g, "")
    }
  }
}

function fail(message) {
  console.error(`\n  ✗ ${message}\n`)
  process.exit(1)
}

async function main() {
  loadEnvLocal()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) fail("NEXT_PUBLIC_SUPABASE_URL is not set (check .env.local).")
  if (!serviceRoleKey) {
    fail(
      "SUPABASE_SERVICE_ROLE_KEY is not set.\n" +
        "    Grab it from Supabase → Project Settings → API → service_role,\n" +
        "    then add it to .env.local. Do NOT commit it or prefix it with NEXT_PUBLIC_."
    )
  }

  const [email, passwordArg] = process.argv.slice(2)
  if (!email) fail("Usage: node scripts/create-admin.mjs <email> [password]")

  let password = passwordArg
  if (!password) {
    const rl = createInterface({ input: stdin, output: stdout })
    password = await rl.question(`Password for ${email}: `)
    rl.close()
  }

  // Supabase enforces a 6 character minimum by default; check early so the
  // failure is readable instead of a raw API error.
  if (!password || password.length < 6) {
    fail("Password must be at least 6 characters.")
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // email_confirm: true skips the confirmation email. The admin login has no
  // verification step, so an unconfirmed user just wouldn't be able to sign in.
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (!error) {
    console.log(`\n  ✓ Created admin login for ${email} (id ${data.user.id})`)
    console.log(`    Sign in at /admin/login\n`)
    return
  }

  // Re-running the script for an existing address is a common case (someone
  // forgot their password), so handle it as a password reset rather than an
  // error the caller has to work around.
  const alreadyExists =
    error.status === 422 || /already (been )?registered|already exists/i.test(error.message)

  if (!alreadyExists) fail(`Supabase rejected the request: ${error.message}`)

  const { data: list, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  if (listError) fail(`Could not look up the existing user: ${listError.message}`)

  const existing = list.users.find(
    (user) => user.email?.toLowerCase() === email.toLowerCase()
  )
  if (!existing) fail(`${email} is taken but could not be found to update.`)

  const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
  })
  if (updateError) fail(`Could not update the password: ${updateError.message}`)

  console.log(`\n  ✓ ${email} already existed -- password updated (id ${existing.id})`)
  console.log(`    Sign in at /admin/login\n`)
}

main().catch((err) => fail(err.message))
