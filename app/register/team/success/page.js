"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Footer } from "@/components/footer"
import {
  Check,
  Copy,
  CheckCircle2,
  Users,
  ArrowRight,
  Mail,
  ExternalLink,
} from "lucide-react"

export default function TeamRegistrationSuccessPage() {
  const searchParams = useSearchParams()
  const [registration, setRegistration] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const registrationId = searchParams.get("registration_id")
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    async function verifyAndFetch() {
      if (!registrationId) {
        setLoading(false)
        return
      }

      // Verify payment with Stripe to handle webhook race condition
      if (sessionId) {
        try {
          await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId }),
          })
        } catch (err) {
          console.error("Payment verification failed:", err)
        }
      }

      try {
        const response = await fetch(`/api/team-registration/${registrationId}`)
        if (response.ok) {
          const data = await response.json()
          setRegistration(data)
        }
      } catch (err) {
        console.error("Failed to fetch registration:", err)
      } finally {
        setLoading(false)
      }
    }

    verifyAndFetch()
  }, [registrationId, sessionId])

  const rosterUrl = registration?.roster_token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/team-roster/${registration.roster_token}`
    : null

  const handleCopyLink = async () => {
    if (rosterUrl) {
      try {
        await navigator.clipboard.writeText(rosterUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("Failed to copy:", err)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#080808]">
        <main className="flex-1 container py-12 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="h-16 w-16 bg-white/10 mx-auto mb-4" />
            <div className="h-6 w-48 bg-white/10 mx-auto mb-2" />
            <div className="h-4 w-32 bg-white/10 mx-auto" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <main className="flex-1 container py-12">
        <div className="bg-[#121212] border border-white/10 max-w-2xl mx-auto p-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-neon/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-neon" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Registration Successful!</h1>
            <p className="text-white/40">
              {registration?.team_name || "Your team"} is registered. Now add your players.
            </p>
          </div>

          {/* Roster Link Section */}
          <div className="bg-neon/5 border border-neon/20 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Users className="h-6 w-6 text-neon mt-0.5" />
              <div>
                <h2 className="font-bold text-white">Enter Your Roster</h2>
                <p className="text-sm text-white/40">
                  Use the link below to add your players (5-15 required)
                </p>
              </div>
            </div>

            {rosterUrl && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={rosterUrl}
                    className="flex-1 px-3 py-2 bg-[#080808] border border-white/10 text-sm font-mono text-white/60 truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="border border-white/20 text-white px-4 py-2 text-sm hover:border-neon hover:text-neon transition-colors shrink-0 inline-flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <Link
                  href={`/team-roster/${registration.roster_token}`}
                  className="flex items-center justify-center gap-2 w-full bg-neon text-black py-3 font-bold uppercase tracking-wider text-sm hover:bg-neon/90 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Enter Roster Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-5 w-5 text-white/40" />
                <span className="font-medium text-white">Invoice Coming Soon</span>
              </div>
              <p className="text-sm text-white/40">
                A registration invoice will be sent to{" "}
                <span className="font-medium text-white">
                  {registration?.captain_email || "your email"}
                </span>
              </p>
            </div>

            <div className="border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-5 w-5 text-white/40" />
                <span className="font-medium text-white">Share Link</span>
              </div>
              <p className="text-sm text-white/40">
                You can share the roster link with your team manager or assistant to help enter players.
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="border border-white/10 p-4 bg-white/5">
            <h3 className="font-medium text-white mb-3">Next Steps</h3>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="bg-neon text-black w-5 h-5 flex items-center justify-center text-xs shrink-0 font-bold">
                  1
                </span>
                <span className="text-white/60">Click the &quot;Enter Roster Now&quot; button above</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-neon text-black w-5 h-5 flex items-center justify-center text-xs shrink-0 font-bold">
                  2
                </span>
                <span className="text-white/60">Add at least 5 players (up to 15 max)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-neon text-black w-5 h-5 flex items-center justify-center text-xs shrink-0 font-bold">
                  3
                </span>
                <span className="text-white/60">Submit your roster to complete registration</span>
              </li>
            </ol>
          </div>

          {/* Footer Links */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-white/10">
            <Link
              href="/"
              className="flex-1 text-center border border-white/20 text-white py-3 text-sm font-bold uppercase tracking-wider hover:border-neon hover:text-neon transition-colors"
            >
              Return to Home
            </Link>
            <Link
              href="/schedule"
              className="flex-1 text-center border border-white/20 text-white py-3 text-sm font-bold uppercase tracking-wider hover:border-neon hover:text-neon transition-colors"
            >
              View Schedule
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
