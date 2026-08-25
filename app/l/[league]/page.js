import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/footer"
import { SponsorBanner } from "@/components/sponsor-banner"
import { MarqueeTicker } from "@/components/marquee-ticker"
import { WaveCrest } from "@/components/wave-crest"
import { greetingsFor } from "@/lib/league-greetings"
import { MatchupCard } from "@/components/matchup-card"
import { GameCard } from "@/components/game-card"
import { ArrowRight, Calendar, Trophy, TrendingUp } from "lucide-react"
import { getTeams, getRecentGames, getUpcomingGames, getAnnouncements, getSponsors } from "@/lib/queries"
import { resolveLeague, leaguePrefix, leagueWordmark, leaguePattern, heroUrlFor } from "@/lib/leagues"
import { calculateWinPercentage, formatDate, formatTime } from "@/lib/utils"

export async function generateMetadata({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)
  return {
    title: league?.name || "Run It League",
    description: league?.tagline || "Track teams, players, schedules, and stats",
  }
}

export default async function HomePage({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)
  const basePath = leaguePrefix(league)
  // A league can supply its own hero artwork through theme.hero_url -- a full
  // URL, or a path under /public -- falling back to artwork committed for
  // that league, then to the drawn SVG wave.
  const heroUrl = heroUrlFor(league)
  const hasWave = !heroUrl && leaguePattern(league) === "seigaiha"

  const [teams, recentGames, upcomingGames, allAnnouncements, sponsors] = await Promise.all([
    getTeams(league.id),
    getRecentGames(league.id, 3),
    getUpcomingGames(league.id, 6),
    getAnnouncements(league.id),
    getSponsors(),
  ])

  const announcements = allAnnouncements.slice(0, 3)

  // Build marquee items. Greetings lead, so the first thing the ticker says
  // is hello in the languages of the communities the league serves.
  const marqueeItems = [
    ...greetingsFor(league),
    "SPRING 2026 SEASON",
    ...upcomingGames.slice(0, 3).map(
      (g) => `${g.home_team?.name || "TBD"} vs ${g.away_team?.name || "TBD"} — ${formatDate(g.game_date)}`
    ),
    ...announcements.map((a) => a.title),
  ].filter(Boolean)

  // Top 3 teams for standings
  const topTeams = teams.slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* ===== HERO ===== */}
        <section
          className={`relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#080808] ${
            // Clear the wave at the foot of the hero, so nothing sits on it.
            hasWave || heroUrl ? "pb-[30vh]" : ""
          }`}
        >
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgb(var(--neon-2)/0.08)_0%,_transparent_70%)]" />

          {/* The league's own artwork, filling the foot of the hero. Its top
              edge is feathered so it blends into the page ground and can
              never collide with the text above it. */}
          {heroUrl && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 w-full h-[38vh] min-h-[220px]"
              style={{
                maskImage: "linear-gradient(to bottom, transparent 0%, black 38%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 38%)",
              }}
            >
              <Image
                src={heroUrl}
                alt=""
                aria-hidden="true"
                fill
                priority
                sizes="100vw"
                className="object-cover object-bottom"
              />
            </div>
          )}

          {hasWave && (
            <WaveCrest className="pointer-events-none absolute inset-x-0 bottom-0 w-full h-[30vh] min-h-[190px]" />
          )}

          <div className="container relative z-10 text-center py-20">
            <Image
              src={league.logo_url || "/assets/Runit.png"}
              alt={league.name}
              width={300}
              height={300}
              className="mx-auto mb-8"
              priority
            />

            <p className="text-white/40 text-sm uppercase tracking-[0.3em] mb-6">
              Spring 2026 Season
            </p>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white max-w-3xl mx-auto mb-6">
              Las Vegas&apos; Most Competitive Adult Basketball League Featuring Former Pros
            </h2>

            <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto mb-10">
              {league.tagline || "Where legends are made. Competitive basketball, organized."}
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link
                href={`${basePath}/schedule`}
                className="bg-neon text-black px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-neon/90 transition-colors inline-flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                View Schedule
              </Link>
              <Link
                href={`${basePath}/register`}
                className="border border-white/20 text-white px-8 py-3 font-bold uppercase tracking-wider text-sm hover:border-neon hover:text-neon transition-colors inline-flex items-center gap-2"
              >
                Register Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-8 text-white/30 text-sm">
              <span>
                <span className="text-neon font-bold text-lg">{teams.length}</span> Teams
              </span>
              <span className="text-white/10">|</span>
              <span>
                <span className="text-neon font-bold text-lg">{recentGames.length + upcomingGames.length}</span> Games
              </span>
            </div>
          </div>
        </section>

        {/* ===== MARQUEE TICKER ===== */}
        <MarqueeTicker items={marqueeItems} />

        {/* ===== UPCOMING SCHEDULE — "THE BOARD" ===== */}
        {upcomingGames.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="container">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-neon text-xs font-bold uppercase tracking-[0.3em] mb-2">
                    Upcoming
                  </p>
                  <h2 className="font-display text-4xl md:text-5xl text-white">
                    THE BOARD
                  </h2>
                </div>
                <Link
                  href={`${basePath}/schedule`}
                  className="hidden md:inline-flex items-center gap-2 text-sm text-white/40 hover:text-neon transition-colors"
                >
                  View All Matchups
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingGames.map((game) => (
                  <MatchupCard key={game.id} game={game} />
                ))}
              </div>

              <Link
                href={`${basePath}/schedule`}
                className="md:hidden flex items-center justify-center gap-2 text-sm text-white/40 hover:text-neon transition-colors mt-6"
              >
                View All Matchups
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        {/* ===== RECENT RESULTS — "FINAL SCORES" ===== */}
        {recentGames.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="container">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-neon text-xs font-bold uppercase tracking-[0.3em] mb-2">
                    Results
                  </p>
                  <h2 className="font-display text-4xl md:text-5xl text-white">
                    FINAL SCORES
                  </h2>
                </div>
                <Link
                  href={`${basePath}/schedule`}
                  className="hidden md:inline-flex items-center gap-2 text-sm text-white/40 hover:text-neon transition-colors"
                >
                  All Results
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>

              <Link
                href={`${basePath}/schedule`}
                className="md:hidden flex items-center justify-center gap-2 text-sm text-white/40 hover:text-neon transition-colors mt-6"
              >
                All Results
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        {/* ===== STANDINGS — "WHO'S ON TOP?" ===== */}
        {topTeams.length > 0 && (
          <section className="py-16 md:py-24 bg-[#0A0A0A]">
            <div className="container">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-neon text-xs font-bold uppercase tracking-[0.3em] mb-2">
                    Standings
                  </p>
                  <h2 className="font-display text-4xl md:text-5xl text-white">
                    WHO&apos;S ON TOP?
                  </h2>
                </div>
                <Link
                  href={`${basePath}/teams`}
                  className="hidden md:inline-flex items-center gap-2 text-sm text-white/40 hover:text-neon transition-colors"
                >
                  Full Leaderboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {topTeams.map((team, index) => {
                  const winPct = calculateWinPercentage(team.wins, team.losses)
                  return (
                    <div
                      key={team.id}
                      className="flex items-center gap-6 bg-[#121212] border border-white/10 p-5 brutal-hover"
                    >
                      {/* Rank */}
                      <span className="font-display text-4xl md:text-5xl text-neon neon-glow w-16 text-center shrink-0">
                        {index + 1}
                      </span>

                      {/* Team info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-xl md:text-2xl text-white truncate">
                          {team.name}
                        </h3>
                      </div>

                      {/* Record */}
                      <div className="text-right shrink-0">
                        <p className="text-white text-lg font-bold">
                          {team.wins}-{team.losses}
                        </p>
                        <p className="text-white/40 text-xs">
                          {winPct.toFixed(3)} WIN%
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Link
                href={`${basePath}/teams`}
                className="md:hidden flex items-center justify-center gap-2 text-sm text-white/40 hover:text-neon transition-colors mt-6"
              >
                Full Leaderboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        {/* ===== VALUE PROPS (White contrast section) ===== */}
        <section className="clip-slant bg-white py-20 md:py-28">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div>
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#080808] text-neon mb-4">
                  <Trophy className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl text-[#080808] mb-2">Competitive Play</h3>
                <p className="text-[#080808]/60 text-sm leading-relaxed">
                  Organized leagues with real standings, playoffs, and championships.
                </p>
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#080808] text-neon mb-4">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl text-[#080808] mb-2">Live Stats</h3>
                <p className="text-[#080808]/60 text-sm leading-relaxed">
                  Track every point, rebound, and assist. Full box scores for every game.
                </p>
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#080808] text-neon mb-4">
                  <Calendar className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl text-[#080808] mb-2">Organized Schedule</h3>
                <p className="text-[#080808]/60 text-sm leading-relaxed">
                  Never miss a game. Full season schedule with times and locations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA BANNER ===== */}
        <section className="py-20 md:py-28 bg-[#080808]">
          <div className="container text-center">
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-4">
              READY TO <span className="text-neon neon-glow">RUN IT</span>?
            </h2>
            <p className="text-white/40 text-sm uppercase tracking-[0.2em] mb-10">
              Spring 2026 Season &mdash; Limited team slots available
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={`${basePath}/register`}
                className="bg-neon text-black px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-neon/90 transition-colors"
              >
                Register Your Team
              </Link>
              <Link
                href={`${basePath}/events`}
                className="border border-white/20 text-white px-8 py-3 font-bold uppercase tracking-wider text-sm hover:border-neon hover:text-neon transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        {/* ===== SPONSORS ===== */}
        <section className="py-16 md:py-20">
          <div className="container">
            <SponsorBanner sponsors={sponsors} />
          </div>
        </section>
      </main>

      <Footer wordmark={leagueWordmark(league)} />
    </div>
  )
}
