import Link from "next/link"
import { formatDate, formatTime } from "@/lib/utils"

export function GameCard({ game, showDate = true }) {
  const isFinal = game.status === "final"
  const isScheduled = game.status === "scheduled"
  const isLive = game.status === "in_progress"
  const homeWon = isFinal && game.home_score > game.away_score
  const awayWon = isFinal && game.away_score > game.home_score

  return (
    <Link href={`/games/${game.id}`}>
      <div className="bg-[#121212] border border-white/10 p-4 brutal-hover cursor-pointer">
        {showDate && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/40">
              {formatDate(game.game_date)}
            </span>
            {isLive ? (
              <span className="bg-neon text-black text-xs font-bold uppercase px-2 py-0.5 animate-pulse">
                Live
              </span>
            ) : isFinal ? (
              <span className="bg-white/10 text-white text-xs font-bold uppercase px-2 py-0.5">
                Final
              </span>
            ) : (
              <span className="border border-white/20 text-white/60 text-xs font-bold uppercase px-2 py-0.5">
                {formatTime(game.game_date)}
              </span>
            )}
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
                  className="w-6 h-6 object-cover"
                />
              ) : (
                <div
                  className="w-6 h-6 flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: game.away_team?.primary_color || "#666" }}
                >
                  {game.away_team?.abbreviation || game.away_team?.name?.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className={awayWon ? "text-white" : "text-white/60"}>
                {game.away_team?.name || "TBD"}
              </span>
            </div>
            {isFinal && (
              <span className={`text-lg ${awayWon ? "text-white font-bold" : "text-white/40"}`}>
                {game.away_score}
              </span>
            )}
          </div>

          {/* Home Team */}
          <div className={`flex items-center justify-between ${homeWon ? "font-bold" : ""}`}>
            <div className="flex items-center space-x-3">
              {game.home_team?.logo_url ? (
                <img
                  src={game.home_team.logo_url}
                  alt={game.home_team.name}
                  className="w-6 h-6 object-cover"
                />
              ) : (
                <div
                  className="w-6 h-6 flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: game.home_team?.primary_color || "#666" }}
                >
                  {game.home_team?.abbreviation || game.home_team?.name?.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className={homeWon ? "text-white" : "text-white/60"}>
                {game.home_team?.name || "TBD"}
              </span>
            </div>
            {isFinal && (
              <span className={`text-lg ${homeWon ? "text-white font-bold" : "text-white/40"}`}>
                {game.home_score}
              </span>
            )}
          </div>
        </div>

        {game.location && (
          <p className="text-xs text-white/40 mt-2">{game.location}</p>
        )}
      </div>
    </Link>
  )
}
