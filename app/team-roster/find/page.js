"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { Users, Loader2, AlertCircle, ArrowRight } from "lucide-react"

export default function FindTeamPage() {
  const router = useRouter()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [teamId, setTeamId] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    async function loadTeams() {
      try {
        const res = await fetch("/api/team-registration/list")
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to load teams")
        setTeams(data.teams || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadTeams()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!teamId) {
      setError("Please select your team")
      return
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/team-registration/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_registration_id: teamId,
          captain_email: email.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to verify email")

      router.push(`/team-roster/${data.roster_token}`)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const selectedTeam = teams.find((t) => t.id === teamId)

  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <main className="flex-1">
        <section className="py-12">
          <div className="container">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-neon" />
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Find Your Team
              </h1>
            </div>
            <p className="text-white/40">
              Lost your roster link? Find your team and enter your players here.
            </p>
          </div>
        </section>

        <div className="container pb-16">
          <div className="max-w-xl mx-auto bg-[#121212] border border-white/10 p-6 md:p-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 text-white/40 animate-spin" />
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-10 w-10 text-white/30 mx-auto mb-3" />
                <p className="text-white/60 mb-2">No teams are eligible for roster entry right now.</p>
                <p className="text-sm text-white/40">
                  If you just registered and paid, give it a few minutes — your
                  team will appear once the payment is confirmed.
                </p>
                <Link
                  href="/register/team"
                  className="inline-flex items-center gap-2 mt-6 border border-white/20 text-white px-6 py-3 text-sm font-bold uppercase tracking-wider hover:border-neon hover:text-neon transition-colors"
                >
                  Register a Team
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="team" className="text-sm font-medium text-white">
                    Your Team *
                  </label>
                  <select
                    id="team"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full px-4 py-2 bg-[#080808] border border-white/10 text-white focus:outline-none focus:border-neon transition-colors appearance-none"
                  >
                    <option value="">Select your team...</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.team_name}
                      </option>
                    ))}
                  </select>
                  {selectedTeam && (
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-4 h-4 border border-white/20"
                        style={{ backgroundColor: selectedTeam.primary_color }}
                      />
                      <div
                        className="w-4 h-4 border border-white/20"
                        style={{ backgroundColor: selectedTeam.secondary_color }}
                      />
                      <span className="text-xs text-white/40">Team colors</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-white">
                    Captain Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="captain@example.com"
                    className="w-full px-4 py-2 bg-[#080808] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-neon transition-colors"
                  />
                  <p className="text-xs text-white/30">
                    Enter the email address used when you registered the team.
                  </p>
                </div>

                {error && (
                  <div className="bg-neon/10 text-neon p-3 text-sm flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-neon text-black px-6 py-3 font-bold uppercase tracking-wider text-sm hover:bg-neon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Continue to Roster
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="pt-4 border-t border-white/10 text-center">
                  <p className="text-xs text-white/40">
                    Haven&apos;t registered yet?{" "}
                    <Link href="/register/team" className="text-neon hover:underline">
                      Register your team
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
