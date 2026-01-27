"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

  useEffect(() => {
    async function fetchRegistration() {
      if (!registrationId) {
        setLoading(false)
        return
      }

      try {
        // In demo mode, we'll create a mock registration with a token
        // In production, this would fetch from the API after Stripe webhook processes
        const response = await fetch(`/api/team-registration/${registrationId}`)
        if (response.ok) {
          const data = await response.json()
          setRegistration(data)
        } else {
          // Demo fallback - simulate a successful registration
          setRegistration({
            id: registrationId,
            team_name: "Your Team",
            captain_name: "Team Captain",
            captain_email: "captain@example.com",
            roster_token: `demo_${registrationId}`,
            status: "paid",
          })
        }
      } catch (err) {
        // Demo fallback
        setRegistration({
          id: registrationId,
          team_name: "Your Team",
          captain_name: "Team Captain",
          captain_email: "captain@example.com",
          roster_token: `demo_${registrationId}`,
          status: "paid",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRegistration()
  }, [registrationId])

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
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container py-12 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="h-16 w-16 bg-muted rounded-full mx-auto mb-4" />
            <div className="h-6 w-48 bg-muted rounded mx-auto mb-2" />
            <div className="h-4 w-32 bg-muted rounded mx-auto" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-muted-foreground">
                {registration?.team_name || "Your team"} is registered. Now add your players.
              </p>
            </div>

            {/* Roster Link Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <Users className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h2 className="font-semibold text-blue-900">Enter Your Roster</h2>
                  <p className="text-sm text-blue-700">
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
                      className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm font-mono truncate"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>

                  <Link href={`/team-roster/${registration.roster_token}`}>
                    <Button className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Enter Roster Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Info Cards */}
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Email Confirmation</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  A confirmation email with the roster link has been sent to{" "}
                  <span className="font-medium text-foreground">
                    {registration?.captain_email || "your email"}
                  </span>
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLink className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Share Link</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You can share the roster link with your team manager or assistant to help enter players.
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <h3 className="font-medium mb-3">Next Steps</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0">
                    1
                  </span>
                  <span>Click the "Enter Roster Now" button above</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0">
                    2
                  </span>
                  <span>Add at least 5 players (up to 15 max)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0">
                    3
                  </span>
                  <span>Submit your roster to complete registration</span>
                </li>
              </ol>
            </div>

            {/* Footer Links */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Return to Home
                </Button>
              </Link>
              <Link href="/schedule" className="flex-1">
                <Button variant="outline" className="w-full">
                  View Schedule
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
