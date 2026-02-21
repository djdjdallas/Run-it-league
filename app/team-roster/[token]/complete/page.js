"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import {
  CheckCircle2,
  Users,
  Calendar,
  Trophy,
  Loader2,
  AlertCircle,
} from "lucide-react"

export default function RosterCompletePage() {
  const params = useParams()
  const token = params.token

  const [registration, setRegistration] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/team-roster/${token}`)
        if (response.ok) {
          const data = await response.json()
          setRegistration(data.registration)
        } else {
          // Demo fallback
          setRegistration({
            team_name: "Your Team",
            status: "roster_complete",
          })
        }
      } catch (err) {
        // Demo fallback
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
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
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
          <CardContent className="py-12">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-3">
                Registration Complete!
              </h1>
              <p className="text-lg text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {registration?.team_name || "Your team"}
                </span>{" "}
                is now officially registered for the season.
              </p>
            </div>

            {/* What's Next */}
            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                What's Next?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Check the Schedule</h3>
                    <p className="text-sm text-muted-foreground">
                      View upcoming games and mark your calendar for game days.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">View Your Team</h3>
                    <p className="text-sm text-muted-foreground">
                      See your team page with all players and upcoming games.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Details */}
            <div className="border rounded-lg p-4 mb-8">
              <h3 className="font-medium mb-3">Registration Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Team Name:</span>
                <span className="font-medium">{registration?.team_name}</span>
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-600 font-medium">Active</span>
                <span className="text-muted-foreground">Season:</span>
                <span>Spring 2026</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/teams" className="flex-1">
                <Button className="w-full" size="lg">
                  <Users className="h-4 w-4 mr-2" />
                  View Teams
                </Button>
              </Link>
              <Link href="/schedule" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Schedule
                </Button>
              </Link>
            </div>

            {/* Home Link */}
            <div className="text-center mt-6 pt-6 border-t">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Return to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
