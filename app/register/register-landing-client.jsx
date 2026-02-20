"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { SponsorBanner } from "@/components/sponsor-banner"
import {
  Users,
  ArrowRight,
  Shield,
  Calendar,
  Trophy,
  Check,
} from "lucide-react"

const teamRegistrationFee = 450.00

export default function RegisterLandingClient({ sponsors }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-500/10 via-background to-background py-12">
          <div className="container text-center">
            <Trophy className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Join Run It League
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Register your team for the upcoming season and compete against the best local talent
            </p>
          </div>
        </section>

        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            {/* Team Registration Card */}
            <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Team Registration</CardTitle>
                    <CardDescription>
                      Register your team for ${teamRegistrationFee}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">What's Included</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        10+ regular season games
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Playoff eligibility
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Professional referees
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Stats tracking for all players
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Live streaming of games
                      </li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3 italic">*Jerseys not included</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">How It Works</h3>
                    <ol className="space-y-2 text-sm list-decimal list-inside text-muted-foreground">
                      <li>Fill out team information and captain details</li>
                      <li>Pay the ${teamRegistrationFee} registration fee</li>
                      <li>Receive a link to enter your roster (5-15 players)</li>
                      <li>Submit your roster to complete registration</li>
                    </ol>
                  </div>
                </div>
                <div className="mt-6">
                  <Link href="/register/team">
                    <Button size="lg" className="w-full md:w-auto">
                      Register Your Team
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <Calendar className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Spring 2025 Season</h3>
                  <p className="text-sm text-muted-foreground">
                    Season runs from March through June 2025. Games are played on weekends.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Users className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Roster Requirements</h3>
                  <p className="text-sm text-muted-foreground">
                    Teams need 5-15 players. Captain enters roster after payment.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Shield className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Secure Payment</h3>
                  <p className="text-sm text-muted-foreground">
                    All payments are processed securely through Stripe.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Can I register as an individual player?</h4>
                  <p className="text-sm text-muted-foreground">
                    Currently, we only accept team registrations. If you're looking to join a team, reach out to us and we can help connect you with teams looking for players.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">What happens after I pay?</h4>
                  <p className="text-sm text-muted-foreground">
                    You'll receive a unique link to enter your team roster. You'll need to add at least 5 player names to complete registration.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Can I modify my roster later?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, roster changes can be made up until the start of the season. Contact the league administrator for roster adjustments.
                  </p>
                </div>
              </CardContent>
            </Card>

            <SponsorBanner sponsors={sponsors} className="mt-8" variant="compact" showTitle={false} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
