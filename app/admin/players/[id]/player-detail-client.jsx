"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ArrowLeft, Pencil, Plus } from "lucide-react"
import { formatDate, calculatePercentage } from "@/lib/utils"

const EMPTY_STAT = {
  minutes: 0,
  points: 0,
  rebounds: 0,
  assists: 0,
  steals: 0,
  blocks: 0,
  turnovers: 0,
  fouls: 0,
  fg_made: 0,
  fg_attempted: 0,
  three_made: 0,
  three_attempted: 0,
  ft_made: 0,
  ft_attempted: 0,
}

const NUMERIC_FIELDS = Object.keys(EMPTY_STAT)

export default function PlayerDetailClient({
  player,
  teamGames,
  initialStats,
}) {
  const router = useRouter()
  const [stats, setStats] = useState(initialStats)
  const [editingGame, setEditingGame] = useState(null)
  const [formData, setFormData] = useState(EMPTY_STAT)
  const [saving, setSaving] = useState(false)

  // Merge: every team game + any stat records on games not in teamGames.
  const rows = useMemo(() => {
    const byGameId = new Map()
    teamGames.forEach((g) => {
      byGameId.set(g.id, { game: g, stat: null })
    })
    stats.forEach((s) => {
      if (!s.game) return
      const existing = byGameId.get(s.game.id)
      if (existing) {
        existing.stat = s
      } else {
        byGameId.set(s.game.id, { game: s.game, stat: s })
      }
    })
    return Array.from(byGameId.values()).sort(
      (a, b) => new Date(b.game.game_date) - new Date(a.game.game_date)
    )
  }, [teamGames, stats])

  const openEditDialog = (row) => {
    setEditingGame(row.game)
    if (row.stat) {
      setFormData(
        NUMERIC_FIELDS.reduce(
          (acc, k) => ({ ...acc, [k]: row.stat[k] ?? 0 }),
          {}
        )
      )
    } else {
      setFormData(EMPTY_STAT)
    }
  }

  const handleSave = async () => {
    if (!editingGame) return
    setSaving(true)

    const supabase = createClient()
    const teamIdForStat =
      player.team_id ||
      stats.find((s) => s.game?.id === editingGame.id)?.team_id ||
      editingGame.home_team_id

    const payload = {
      game_id: editingGame.id,
      player_id: player.id,
      team_id: teamIdForStat,
      ...NUMERIC_FIELDS.reduce(
        (acc, k) => ({ ...acc, [k]: parseInt(formData[k]) || 0 }),
        {}
      ),
    }

    const { data, error } = await supabase
      .from("player_stats")
      .upsert(payload, { onConflict: "game_id,player_id" })
      .select(
        `*, game:games(*, home_team:teams!games_home_team_id_fkey(*), away_team:teams!games_away_team_id_fkey(*))`
      )
      .single()

    if (error) {
      alert("Failed to save stats: " + error.message)
      setSaving(false)
      return
    }

    setStats((prev) => {
      const idx = prev.findIndex((s) => s.game?.id === editingGame.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = data
        return next
      }
      return [data, ...prev]
    })

    setSaving(false)
    setEditingGame(null)
    router.refresh()
  }

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getOpponent = (game) => {
    if (!player.team_id) {
      return `${game.away_team?.abbreviation || "Away"} @ ${game.home_team?.abbreviation || "Home"}`
    }
    const isHome = game.home_team_id === player.team_id
    const opp = isHome ? game.away_team : game.home_team
    return isHome ? `vs ${opp?.abbreviation || "?"}` : `@ ${opp?.abbreviation || "?"}`
  }

  return (
    <div>
      <Link
        href={player.team_id ? `/admin/teams/${player.team_id}` : "/admin/players"}
      >
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {player.team_id ? "Back to Team" : "Back to Players"}
        </Button>
      </Link>

      {/* Player header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        {player.photo_url ? (
          <img
            src={player.photo_url}
            alt={player.name}
            className="w-16 h-16 object-cover rounded-full"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold">
            {player.name.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{player.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            {player.number != null && <span>#{player.number}</span>}
            {player.team && (
              <Link
                href={`/admin/teams/${player.team.id}`}
                className="hover:text-foreground underline-offset-4 hover:underline"
              >
                {player.team.name}
              </Link>
            )}
            {player.position && <Badge variant="outline">{player.position}</Badge>}
            {player.height && <span>{player.height}</span>}
            <Badge variant={player.is_active ? "success" : "secondary"}>
              {player.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Per-game stats */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Game-by-Game Stats</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {rows.length === 0
                ? "No games yet."
                : `${rows.filter((r) => r.stat).length} of ${rows.length} game${rows.length === 1 ? "" : "s"} have stats recorded.`}
            </p>
          </div>

          {rows.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No games scheduled for this player&apos;s team yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Opp</TableHead>
                    <TableHead className="text-center">MIN</TableHead>
                    <TableHead className="text-center">PTS</TableHead>
                    <TableHead className="text-center">REB</TableHead>
                    <TableHead className="text-center">AST</TableHead>
                    <TableHead className="text-center hidden md:table-cell">STL</TableHead>
                    <TableHead className="text-center hidden md:table-cell">BLK</TableHead>
                    <TableHead className="text-center hidden lg:table-cell">FG</TableHead>
                    <TableHead className="text-center hidden lg:table-cell">3P</TableHead>
                    <TableHead className="text-center hidden lg:table-cell">FT</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.game.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDate(row.game.game_date)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getOpponent(row.game)}
                      </TableCell>
                      {row.stat ? (
                        <>
                          <TableCell className="text-center">{row.stat.minutes}</TableCell>
                          <TableCell className="text-center font-medium">{row.stat.points}</TableCell>
                          <TableCell className="text-center">{row.stat.rebounds}</TableCell>
                          <TableCell className="text-center">{row.stat.assists}</TableCell>
                          <TableCell className="text-center hidden md:table-cell">{row.stat.steals}</TableCell>
                          <TableCell className="text-center hidden md:table-cell">{row.stat.blocks}</TableCell>
                          <TableCell className="text-center hidden lg:table-cell text-xs">
                            {row.stat.fg_made}-{row.stat.fg_attempted}{" "}
                            <span className="text-muted-foreground">
                              ({calculatePercentage(row.stat.fg_made, row.stat.fg_attempted)}%)
                            </span>
                          </TableCell>
                          <TableCell className="text-center hidden lg:table-cell text-xs">
                            {row.stat.three_made}-{row.stat.three_attempted}
                          </TableCell>
                          <TableCell className="text-center hidden lg:table-cell text-xs">
                            {row.stat.ft_made}-{row.stat.ft_attempted}
                          </TableCell>
                        </>
                      ) : (
                        <TableCell
                          colSpan={9}
                          className="text-center text-sm text-muted-foreground italic"
                        >
                          No stats recorded
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(row)}
                        >
                          {row.stat ? (
                            <>
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog
        open={!!editingGame}
        onOpenChange={(v) => !v && !saving && setEditingGame(null)}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Stats</DialogTitle>
            <DialogDescription>
              {editingGame
                ? `${player.name} — ${getOpponent(editingGame)} on ${formatDate(editingGame.game_date)}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-4">
            <StatField label="MIN" value={formData.minutes} onChange={(v) => updateField("minutes", v)} />
            <StatField label="PTS" value={formData.points} onChange={(v) => updateField("points", v)} />
            <StatField label="REB" value={formData.rebounds} onChange={(v) => updateField("rebounds", v)} />
            <StatField label="AST" value={formData.assists} onChange={(v) => updateField("assists", v)} />
            <StatField label="STL" value={formData.steals} onChange={(v) => updateField("steals", v)} />
            <StatField label="BLK" value={formData.blocks} onChange={(v) => updateField("blocks", v)} />
            <StatField label="TO" value={formData.turnovers} onChange={(v) => updateField("turnovers", v)} />
            <StatField label="PF" value={formData.fouls} onChange={(v) => updateField("fouls", v)} />
          </div>

          <div className="space-y-3">
            <ShootingRow
              label="FG"
              made={formData.fg_made}
              attempted={formData.fg_attempted}
              onMade={(v) => updateField("fg_made", v)}
              onAttempted={(v) => updateField("fg_attempted", v)}
            />
            <ShootingRow
              label="3PT"
              made={formData.three_made}
              attempted={formData.three_attempted}
              onMade={(v) => updateField("three_made", v)}
              onAttempted={(v) => updateField("three_attempted", v)}
            />
            <ShootingRow
              label="FT"
              made={formData.ft_made}
              attempted={formData.ft_attempted}
              onMade={(v) => updateField("ft_made", v)}
              onAttempted={(v) => updateField("ft_attempted", v)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingGame(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Stats"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatField({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function ShootingRow({ label, made, attempted, onMade, onAttempted }) {
  const pct =
    parseInt(attempted) > 0 ? calculatePercentage(parseInt(made) || 0, parseInt(attempted)) : null
  return (
    <div className="grid grid-cols-[60px_1fr_1fr_60px] items-end gap-2">
      <Label className="text-xs pb-2">{label}</Label>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Made</Label>
        <Input
          type="number"
          min="0"
          value={made}
          onChange={(e) => onMade(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Att</Label>
        <Input
          type="number"
          min="0"
          value={attempted}
          onChange={(e) => onAttempted(e.target.value)}
        />
      </div>
      <div className="text-xs text-muted-foreground tabular-nums text-right pb-2">
        {pct != null ? `${pct}%` : "—"}
      </div>
    </div>
  )
}
