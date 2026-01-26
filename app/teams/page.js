import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import { sampleTeams } from "@/lib/sample-data"
import { calculateWinPercentage } from "@/lib/utils"

export const metadata = {
  title: "Teams - Run It League",
  description: "View all teams in the Run It League",
}

export default function TeamsPage() {
  // Sort teams by win percentage
  const teams = [...sampleTeams].sort((a, b) => {
    const pctA = calculateWinPercentage(a.wins, a.losses)
    const pctB = calculateWinPercentage(b.wins, b.losses)
    return pctB - pctA
  })

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
            <p className="text-muted-foreground mt-2">
              All teams competing in the current season
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team, index) => (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        {team.logo_url ? (
                          <img
                            src={team.logo_url}
                            alt={team.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                            style={{ backgroundColor: team.primary_color || "#000" }}
                          >
                            {team.abbreviation || team.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h2 className="text-xl font-semibold">{team.name}</h2>
                          <p className="text-sm text-muted-foreground">
                            {team.abbreviation}
                          </p>
                        </div>
                      </div>
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex space-x-4">
                        <div>
                          <span className="text-muted-foreground">W: </span>
                          <span className="font-medium">{team.wins}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">L: </span>
                          <span className="font-medium">{team.losses}</span>
                        </div>
                      </div>
                      <div className="text-lg font-bold">
                        {calculateWinPercentage(team.wins, team.losses)
                          .toFixed(3)
                          .replace("0.", ".")}
                      </div>
                    </div>

                    <div
                      className="h-1 rounded-full mt-4"
                      style={{
                        background: `linear-gradient(to right, ${team.primary_color} 0%, ${team.secondary_color} 100%)`,
                      }}
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
