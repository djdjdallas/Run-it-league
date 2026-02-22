import { formatDate, formatTime } from "@/lib/utils"
import { MapPin } from "lucide-react"

export function MatchupCard({ game }) {
  const home = game.home_team
  const away = game.away_team

  return (
    <div className="bg-[#121212] border border-white/10 p-6 brutal-hover">
      {/* Date & Time */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-white/40 uppercase tracking-wider">
          {formatDate(game.game_date)}
        </span>
        <span className="text-xs font-bold text-neon uppercase tracking-wider">
          {formatTime(game.game_date)}
        </span>
      </div>

      {/* Matchup */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 text-right">
          <p className="font-display text-lg leading-tight text-white">
            {home?.name || "TBD"}
          </p>
          {home && (
            <p className="text-xs text-white/40 mt-1">
              {home.wins}-{home.losses}
            </p>
          )}
        </div>

        <div className="font-display text-2xl text-neon neon-glow px-2 shrink-0">
          VS
        </div>

        <div className="flex-1">
          <p className="font-display text-lg leading-tight text-white">
            {away?.name || "TBD"}
          </p>
          {away && (
            <p className="text-xs text-white/40 mt-1">
              {away.wins}-{away.losses}
            </p>
          )}
        </div>
      </div>

      {/* Location */}
      {game.location && (
        <div className="flex items-center gap-1.5 text-white/30 text-xs">
          <MapPin className="h-3 w-3" />
          <span>{game.location}</span>
        </div>
      )}
    </div>
  )
}
