"use client"

import Link from "next/link"
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

const teamRegistrationFee = 500.00

export default function RegisterLandingClient({ sponsors }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-20">
          <div className="container text-center">
            <Trophy className="h-16 w-16 text-neon mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
              Join Run It League
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Register your team for the upcoming season and compete against the best local talent
            </p>
          </div>
        </section>

        <div className="container pb-16">
          <div className="max-w-4xl mx-auto">
            {/* Team Registration Card */}
            <div className="bg-[#121212] border border-white/10 p-6 md:p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-neon/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-neon" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Team Registration</h2>
                  <p className="text-white/40 text-sm">
                    Register your team for ${teamRegistrationFee}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-white mb-3">What&apos;s Included</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-white/60">
                      <Check className="h-4 w-4 text-neon" />
                      10+ regular season games
                    </li>
                    <li className="flex items-center gap-2 text-white/60">
                      <Check className="h-4 w-4 text-neon" />
                      Playoff eligibility
                    </li>
                    <li className="flex items-center gap-2 text-white/60">
                      <Check className="h-4 w-4 text-neon" />
                      Professional referees
                    </li>
                    <li className="flex items-center gap-2 text-white/60">
                      <Check className="h-4 w-4 text-neon" />
                      Stats tracking for all players
                    </li>
                    <li className="flex items-center gap-2 text-white/60">
                      <Check className="h-4 w-4 text-neon" />
                      Live streaming of games
                    </li>
                  </ul>
                  <p className="text-xs text-white/30 mt-3 italic">*Jerseys not included</p>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-3">How It Works</h3>
                  <ol className="space-y-2 text-sm list-decimal list-inside text-white/40">
                    <li>Fill out team information and captain details</li>
                    <li>Pay the ${teamRegistrationFee} registration fee</li>
                    <li>Receive a link to enter your roster (5-15 players)</li>
                    <li>Submit your roster to complete registration</li>
                  </ol>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  href="/register/team"
                  className="inline-flex items-center gap-2 bg-neon text-black px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-neon/90 transition-colors"
                >
                  Register Your Team
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#121212] border border-white/10 p-6">
                <Calendar className="h-8 w-8 text-neon mb-3" />
                <h3 className="font-bold text-white mb-2">Spring 2026 Season</h3>
                <p className="text-sm text-white/40">
                  Season runs from March through June 2026. Games are played on weekends.
                </p>
              </div>
              <div className="bg-[#121212] border border-white/10 p-6">
                <Users className="h-8 w-8 text-neon mb-3" />
                <h3 className="font-bold text-white mb-2">Roster Requirements</h3>
                <p className="text-sm text-white/40">
                  Teams need 5-15 players. Captain enters roster after payment.
                </p>
              </div>
              <div className="bg-[#121212] border border-white/10 p-6">
                <Shield className="h-8 w-8 text-neon mb-3" />
                <h3 className="font-bold text-white mb-2">Secure Payment</h3>
                <p className="text-sm text-white/40">
                  All payments are processed securely through Stripe.
                </p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-[#121212] border border-white/10 p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-1">Can I register as an individual player?</h4>
                  <p className="text-sm text-white/40">
                    Currently, we only accept team registrations. If you&apos;re looking to join a team, reach out to us and we can help connect you with teams looking for players.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">What happens after I pay?</h4>
                  <p className="text-sm text-white/40">
                    You&apos;ll receive a unique link to enter your team roster. You&apos;ll need to add at least 5 player names to complete registration.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">Can I modify my roster later?</h4>
                  <p className="text-sm text-white/40">
                    Yes, roster changes can be made up until the start of the season. Contact the league administrator for roster adjustments.
                  </p>
                </div>
              </div>
            </div>

            <SponsorBanner sponsors={sponsors} className="mt-8" variant="compact" showTitle={false} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
