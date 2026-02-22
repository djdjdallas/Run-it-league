"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Footer } from "@/components/footer"
import {
  CheckCircle2,
  Users,
  Calendar,
  Trophy,
  Loader2,
} from "lucide-react"

export default function RosterCompletePage() {
  const params = useParams()
  const token = params.token

  const [registration, setRegistration] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/team-roster/${token}`)
        if (response.ok) {
          const data = await response.json()
          setRegistration(data.registration)
        } else {
          setRegistration({
            team_name: "Your Team",
            status: "roster_complete",
          })
        }
      } catch (err) {
        setRegistration({
          team_name: "Your Team",
          status: "roster_complete",
        })
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchData()
    }
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#080808]">
        <main className="flex-1 container py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-neon mx-auto mb-4" />
            <p className="text-white/40">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <main className="flex-1 container py-12">
        <div className="bg-[#121212] border border-white/10 max-w-2xl mx-auto p-8 md:p-12">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-neon/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-neon" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              Registration Complete!
            </h1>
            <p className="text-lg text-white/40">
              <span className="font-bold text-white">
                {registration?.team_name || "Your team"}
              </span>{" "}
              is now officially registered for the season.
            </p>
          </div>

          {/* What's Next */}
          <div className="bg-white/5 border border-white/10 p-6 mb-8">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-neon" />
              What&apos;s Next?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-neon/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-neon" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Check the Schedule</h3>
                  <p className="text-sm text-white/40">
                    View upcoming games and mark your calendar for game days.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-neon/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-neon" />
                </div>
                <div>
                  <h3 className="font-medium text-white">View Your Team</h3>
                  <p className="text-sm text-white/40">
                    See your team page with all players and upcoming games.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Details */}
          <div className="border border-white/10 p-4 mb-8">
            <h3 className="font-medium text-white mb-3">Registration Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-white/40">Team Name:</span>
              <span className="font-medium text-white">{registration?.team_name}</span>
              <span className="text-white/40">Status:</span>
              <span className="text-neon font-medium">Active</span>
              <span className="text-white/40">Season:</span>
              <span className="text-white/60">Spring 2026</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/teams"
              className="flex-1 text-center bg-neon text-black py-3 font-bold uppercase tracking-wider text-sm hover:bg-neon/90 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Users className="h-4 w-4" />
              View Teams
            </Link>
            <Link
              href="/schedule"
              className="flex-1 text-center border border-white/20 text-white py-3 font-bold uppercase tracking-wider text-sm hover:border-neon hover:text-neon transition-colors inline-flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              View Schedule
            </Link>
          </div>

          {/* Home Link */}
          <div className="text-center mt-6 pt-6 border-t border-white/10">
            <Link
              href="/"
              className="text-sm text-white/40 hover:text-neon transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
