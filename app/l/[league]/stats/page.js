import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Footer } from "@/components/footer"
import { getStatLeaders } from "@/lib/queries"
import { resolveLeague, leaguePrefix, leagueWordmark } from "@/lib/leagues"

export async function generateMetadata({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)
  return {
    title: `Stat Leaders - ${league?.name || "Run It League"}`,
    description: `View statistical leaders in the ${league?.name || "Run It League"}`,
  }
}

export default async function StatsPage({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)
  const basePath = leaguePrefix(league)

  const [pointsLeaders, reboundsLeaders, assistsLeaders, stealsLeaders, blocksLeaders] = await Promise.all([
    getStatLeaders(league.id, "points", 10),
    getStatLeaders(league.id, "rebounds", 10),
    getStatLeaders(league.id, "assists", 10),
    getStatLeaders(league.id, "steals", 10),
    getStatLeaders(league.id, "blocks", 10),
  ])

  const tabs = [
    { id: "points", label: "Points", leaders: pointsLeaders, statName: "PPG", title: "Points Per Game Leaders" },
    { id: "rebounds", label: "Rebounds", leaders: reboundsLeaders, statName: "RPG", title: "Rebounds Per Game Leaders" },
    { id: "assists", label: "Assists", leaders: assistsLeaders, statName: "APG", title: "Assists Per Game Leaders" },
    { id: "steals", label: "Steals", leaders: stealsLeaders, statName: "SPG", title: "Steals Per Game Leaders" },
    { id: "blocks", label: "Blocks", leaders: blocksLeaders, statName: "BPG", title: "Blocks Per Game Leaders" },
  ]

  const StatTable = ({ leaders, statName }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Player</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-center">GP</TableHead>
          <TableHead className="text-center">{statName}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaders.map((leader, index) => {
          const team = leader.player?.team
          return (
            <TableRow key={leader.player_id}>
              <TableCell className={`font-medium ${index === 0 ? "text-neon" : "text-white/60"}`}>
                {index + 1}
              </TableCell>
              <TableCell>
                <Link
                  href={`${basePath}/players/${leader.player?.id}`}
                  className="text-white hover:text-neon transition-colors font-medium"
                >
                  {leader.player?.name}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`${basePath}/teams/${team?.id}`}
                  className="text-white/40 hover:text-neon transition-colors"
                >
                  {team?.abbreviation || "-"}
                </Link>
              </TableCell>
              <TableCell className="text-center">{leader.games}</TableCell>
              <TableCell className="text-center text-white font-bold">{leader.avg}</TableCell>
            </TableRow>
          )
        })}
        {leaders.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-white/40 py-8">
              No stats recorded yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )

  // Server component — tabs rendered as details/summary for no-JS support,
  // but we'll render all tabs and use CSS :target or just show all sections
  // Since this is a server component, we render all tabs visible with anchors

  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <main className="flex-1">
        {/* Header */}
        <section className="py-16 md:py-24">
          <div className="container">
            <p className="text-neon text-xs font-bold uppercase tracking-[0.3em] mb-2">
              Statistics
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-white">
              STAT LEADERS
            </h1>
          </div>
        </section>

        <div className="container pb-16">
          {/* Top 3 Quick View */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {[
              { leader: pointsLeaders[0], label: "PPG", title: "Top Scorer" },
              { leader: reboundsLeaders[0], label: "RPG", title: "Top Rebounder" },
              { leader: assistsLeaders[0], label: "APG", title: "Top Playmaker" },
            ].map(({ leader, label, title }) => (
              <div key={title} className="bg-[#121212] border border-white/10 p-6">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-4">{title}</p>
                {leader ? (
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 flex items-center justify-center text-white font-bold"
                      style={{
                        backgroundColor: leader.player?.team?.primary_color || "#666",
                      }}
                    >
                      {leader.player?.number || "?"}
                    </div>
                    <div>
                      <Link
                        href={`${basePath}/players/${leader.player?.id}`}
                        className="font-bold text-white hover:text-neon transition-colors"
                      >
                        {leader.player?.name}
                      </Link>
                      <div className="text-3xl font-bold text-neon">
                        {leader.avg} <span className="text-white/40 text-xs uppercase">{label}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/40">No data</p>
                )}
              </div>
            ))}
          </div>

          {/* Stat Tables */}
          <div className="space-y-12">
            {tabs.map((tab) => (
              <div key={tab.id}>
                <div className="bg-[#121212] border border-white/10">
                  <div className="px-6 py-4 border-b border-white/10">
                    <h2 className="font-display text-xl text-white">{tab.title}</h2>
                  </div>
                  <div className="p-4">
                    <StatTable leaders={tab.leaders} statName={tab.statName} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer wordmark={leagueWordmark(league)} />
    </div>
  )
}
