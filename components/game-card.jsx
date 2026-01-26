import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatTime } from "@/lib/utils"

export function GameCard({ game, showDate = true }) {
  const isFinal = game.status === "final"
  const isScheduled = game.status === "scheduled"
  const homeWon = isFinal && game.home_score > game.away_score
  const awayWon = isFinal && game.away_score > game.home_score

  return (
    <Link href={`/games/${game.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          {showDate && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {formatDate(game.game_date)}
              </span>
              <Badge
                variant={isFinal ? "secondary" : isScheduled ? "outline" : "default"}
              >
                {game.status === "final"
                  ? "Final"
                  : game.status === "in_progress"
                  ? "Live"
                  : formatTime(game.game_date)}
              </Badge>
            </div>
          )}

          <div className="space-y-2">
            {/* Away Team */}
            <div className={`flex items-center justify-between ${awayWon ? "font-bold" : ""}`}>
              <div className="flex items-center space-x-3">
                {game.away_team?.logo_url ? (
                  <img
                    src={game.away_team.logo_url}
                    alt={game.away_team.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: game.away_team?.primary_color || "#666" }}
                  >
                    {game.away_team?.abbreviation || game.away_team?.name?.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span>{game.away_team?.name || "TBD"}</span>
              </div>
              {isFinal && (
                <span className="text-lg">{game.away_score}</span>
              )}
            </div>

            {/* Home Team */}
            <div className={`flex items-center justify-between ${homeWon ? "font-bold" : ""}`}>
              <div className="flex items-center space-x-3">
                {game.home_team?.logo_url ? (
                  <img
                    src={game.home_team.logo_url}
                    alt={game.home_team.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: game.home_team?.primary_color || "#666" }}
                  >
                    {game.home_team?.abbreviation || game.home_team?.name?.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span>{game.home_team?.name || "TBD"}</span>
              </div>
              {isFinal && (
                <span className="text-lg">{game.home_score}</span>
              )}
            </div>
          </div>

          {game.location && (
            <p className="text-xs text-muted-foreground mt-2">{game.location}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
