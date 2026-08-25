import Link from "next/link"
import { Footer } from "@/components/footer"
import { getTeams } from "@/lib/queries"
import { resolveLeague, leaguePrefix, leagueWordmark } from "@/lib/leagues"
import { calculateWinPercentage } from "@/lib/utils"

export async function generateMetadata({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)
  return {
    title: `Teams - ${league?.name || "Run It League"}`,
    description: `View all teams in the ${league?.name || "Run It League"}`,
  }
}

export default async function TeamsPage({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)
  const basePath = leaguePrefix(league)

  const allTeams = await getTeams(league.id)

  // Sort teams by win percentage
  const teams = [...allTeams].sort((a, b) => {
    const pctA = calculateWinPercentage(a.wins, a.losses)
    const pctB = calculateWinPercentage(b.wins, b.losses)
    return pctB - pctA
  })

  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <main className="flex-1">
        {/* Header */}
        <section className="py-16 md:py-24">
          <div className="container">
            <p className="text-neon text-xs font-bold uppercase tracking-[0.3em] mb-2">
              Leaderboard
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-white">
              THE TEAMS
            </h1>
          </div>
        </section>

        <div className="container pb-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team, index) => (
              <Link key={team.id} href={`${basePath}/teams/${team.id}`}>
                <div className="bg-[#121212] border border-white/10 p-6 brutal-hover cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {team.logo_url ? (
                        <img
                          src={team.logo_url}
                          alt={team.name}
                          className="w-16 h-16 object-cover"
                        />
                      ) : (
                        <div
                          className="w-16 h-16 flex items-center justify-center text-white text-xl font-bold"
                          style={{ backgroundColor: team.primary_color || "#000" }}
                        >
                          {team.abbreviation || team.name?.substring(0, 2).toUpperCase() || "?"}
                        </div>
                      )}
                      <div>
                        <h2 className="font-display text-xl text-white">{team.name}</h2>
                        <p className="text-sm text-white/40">
                          {team.abbreviation}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-display text-3xl ${
                        index < 3
                          ? "text-neon neon-glow"
                          : "text-white/20"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex space-x-4">
                      <div>
                        <span className="text-white/40">W: </span>
                        <span className="font-medium text-white">{team.wins}</span>
                      </div>
                      <div>
                        <span className="text-white/40">L: </span>
                        <span className="font-medium text-white">{team.losses}</span>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-neon">
                      {calculateWinPercentage(team.wins, team.losses)
                        .toFixed(3)
                        .replace("0.", ".")}
                    </div>
                  </div>

                  <div
                    className="h-1 mt-4"
                    style={{
                      background: `linear-gradient(to right, ${team.primary_color} 0%, ${team.secondary_color} 100%)`,
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>

          {teams.length === 0 && (
            <div className="bg-[#121212] border border-white/10 py-12 text-center">
              <p className="text-white/40">No teams found.</p>
            </div>
          )}
        </div>
      </main>
      <Footer wordmark={leagueWordmark(league)} />
    </div>
  )
}
