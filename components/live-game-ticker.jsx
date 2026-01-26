"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Radio, ChevronRight, RefreshCw } from "lucide-react"
import { sampleGames, sampleTeams } from "@/lib/sample-data"

export function LiveGameTicker({ pollInterval = 30000 }) {
  const [games, setGames] = useState([])
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Simulate fetching live game data
  const fetchLiveGames = async () => {
    setIsRefreshing(true)
    // In production, this would fetch from Supabase
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Get games that could be "live" (in_progress status)
    const liveGames = sampleGames.filter((g) => g.status === "in_progress")

    // Simulate live score updates
    const updatedGames = liveGames.map((game) => ({
      ...game,
      home_team: sampleTeams.find((t) => t.id === game.home_team_id),
      away_team: sampleTeams.find((t) => t.id === game.away_team_id),
      // Simulate score changes
      home_score: game.home_score + Math.floor(Math.random() * 3),
      away_score: game.away_score + Math.floor(Math.random() * 3),
      quarter: "Q" + Math.ceil(Math.random() * 4),
      time_remaining: `${Math.floor(Math.random() * 12)}:${String(
        Math.floor(Math.random() * 60)
      ).padStart(2, "0")}`,
    }))

    setGames(updatedGames)
    setLastUpdate(new Date())
    setIsRefreshing(false)
  }

  useEffect(() => {
    fetchLiveGames()
    const interval = setInterval(fetchLiveGames, pollInterval)
    return () => clearInterval(interval)
  }, [pollInterval])

  if (games.length === 0) {
    return null
  }

  return (
    <Card className="border-red-500/50 bg-red-500/5">
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="animate-pulse">
              <Radio className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
            <span className="text-sm text-muted-foreground">
              {games.length} game{games.length > 1 ? "s" : ""} in progress
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchLiveGames}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <div className="space-y-3">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="block bg-background rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                {/* Away Team */}
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{
                      backgroundColor: game.away_team?.primary_color || "#666",
                    }}
                  >
                    {game.away_team?.abbreviation || "?"}
                  </div>
                  <div>
                    <p className="font-medium">{game.away_team?.name}</p>
                    <p className="text-2xl font-bold">{game.away_score}</p>
                  </div>
                </div>

                {/* Game Status */}
                <div className="text-center px-4">
                  <Badge variant="outline" className="mb-1">
                    {game.quarter}
                  </Badge>
                  <p className="text-lg font-mono">{game.time_remaining}</p>
                </div>

                {/* Home Team */}
                <div className="flex items-center gap-3 flex-1 justify-end text-right">
                  <div>
                    <p className="font-medium">{game.home_team?.name}</p>
                    <p className="text-2xl font-bold">{game.home_score}</p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{
                      backgroundColor: game.home_team?.primary_color || "#666",
                    }}
                  >
                    {game.home_team?.abbreviation || "?"}
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground ml-2" />
              </div>
            </Link>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  )
}

// Compact version for sidebars
export function LiveScoreWidget() {
  const [games, setGames] = useState([])

  useEffect(() => {
    // Get in-progress games
    const liveGames = sampleGames
      .filter((g) => g.status === "in_progress")
      .map((game) => ({
        ...game,
        home_team: sampleTeams.find((t) => t.id === game.home_team_id),
        away_team: sampleTeams.find((t) => t.id === game.away_team_id),
      }))
    setGames(liveGames)
  }, [])

  if (games.length === 0) return null

  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="destructive" className="animate-pulse text-xs">
            <Radio className="h-2 w-2 mr-1" />
            LIVE
          </Badge>
        </div>
        <div className="space-y-2">
          {games.slice(0, 2).map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="block text-sm hover:bg-muted/50 rounded p-2 -mx-2"
            >
              <div className="flex justify-between">
                <span>{game.away_team?.abbreviation}</span>
                <span className="font-bold">{game.away_score}</span>
              </div>
              <div className="flex justify-between">
                <span>{game.home_team?.abbreviation}</span>
                <span className="font-bold">{game.home_score}</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
