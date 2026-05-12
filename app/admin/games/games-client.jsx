"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, TrendingUp } from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils"

export default function GamesClient({ initialGames, teams }) {
  const router = useRouter()
  const [games, setGames] = useState(initialGames)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGame, setEditingGame] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({
    home_team_id: "",
    away_team_id: "",
    game_date: "",
    game_time: "",
    location: "",
    status: "scheduled",
    home_score: "",
    away_score: "",
  })

  const openCreateDialog = () => {
    setEditingGame(null)
    setFormData({
      home_team_id: "",
      away_team_id: "",
      game_date: "",
      game_time: "",
      location: "",
      status: "scheduled",
      home_score: "",
      away_score: "",
    })
    setDialogOpen(true)
  }

  const openEditDialog = (game) => {
    setEditingGame(game)
    const gameDate = new Date(game.game_date)
    setFormData({
      home_team_id: game.home_team_id,
      away_team_id: game.away_team_id,
      game_date: gameDate.toISOString().split("T")[0],
      game_time: gameDate.toTimeString().slice(0, 5),
      location: game.location || "",
      status: game.status,
      home_score: game.home_score?.toString() || "",
      away_score: game.away_score?.toString() || "",
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    const gameDateTime = new Date(
      `${formData.game_date}T${formData.game_time || "12:00"}`
    )

    const gameData = {
      home_team_id: formData.home_team_id,
      away_team_id: formData.away_team_id,
      game_date: gameDateTime.toISOString(),
      location: formData.location || null,
      status: formData.status,
      home_score:
        formData.status === "final" ? parseInt(formData.home_score) || 0 : null,
      away_score:
        formData.status === "final" ? parseInt(formData.away_score) || 0 : null,
    }

    if (editingGame) {
      const { error } = await supabase
        .from("games")
        .update(gameData)
        .eq("id", editingGame.id)

      if (error) {
        alert("Failed to update game: " + error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase
        .from("games")
        .insert(gameData)

      if (error) {
        alert("Failed to create game: " + error.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setDialogOpen(false)
    router.refresh()
  }

  const confirmDelete = async () => {
    const game = deleteTarget
    if (!game) return

    const prev = games
    setGames(games.filter((g) => g.id !== game.id))

    const supabase = createClient()
    const { error } = await supabase.from("games").delete().eq("id", game.id)

    if (error) {
      alert("Failed to delete game: " + error.message)
      setGames(prev)
    }
  }

  // Sort games by date (most recent first)
  const sortedGames = [...games].sort(
    (a, b) => new Date(b.game_date) - new Date(a.game_date)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Games</h1>
          <p className="text-muted-foreground mt-2">
            Manage game schedule and results
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Game
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Matchup</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedGames.map((game) => (
                <TableRow key={game.id}>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(game.game_date)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(game.game_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {game.away_team?.name || "TBD"} @{" "}
                      {game.home_team?.name || "TBD"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {game.status === "final" ? (
                      <span className="font-bold">
                        {game.away_score} - {game.home_score}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        game.status === "final"
                          ? "secondary"
                          : game.status === "in_progress"
                          ? "default"
                          : "outline"
                      }
                    >
                      {game.status === "final"
                        ? "Final"
                        : game.status === "in_progress"
                        ? "Live"
                        : "Scheduled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {game.location || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {game.status === "final" && (
                      <Link href={`/admin/games/${game.id}/stats`}>
                        <Button variant="ghost" size="icon" title="Enter Stats">
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(game)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(game)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingGame ? "Edit Game" : "Schedule Game"}
            </DialogTitle>
            <DialogDescription>
              {editingGame
                ? "Update the game details below."
                : "Enter the details for the new game."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="away_team_id">Away Team</Label>
              <Select
                id="away_team_id"
                value={formData.away_team_id}
                onChange={(e) =>
                  setFormData({ ...formData, away_team_id: e.target.value })
                }
              >
                <option value="">Select team...</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="home_team_id">Home Team</Label>
              <Select
                id="home_team_id"
                value={formData.home_team_id}
                onChange={(e) =>
                  setFormData({ ...formData, home_team_id: e.target.value })
                }
              >
                <option value="">Select team...</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="game_date">Date</Label>
                <Input
                  id="game_date"
                  type="date"
                  value={formData.game_date}
                  onChange={(e) =>
                    setFormData({ ...formData, game_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="game_time">Time</Label>
                <Input
                  id="game_time"
                  type="time"
                  value={formData.game_time}
                  onChange={(e) =>
                    setFormData({ ...formData, game_time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Main Gym"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="final">Final</option>
              </Select>
            </div>

            {formData.status === "final" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="away_score">Away Score</Label>
                  <Input
                    id="away_score"
                    type="number"
                    value={formData.away_score}
                    onChange={(e) =>
                      setFormData({ ...formData, away_score: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="home_score">Home Score</Label>
                  <Input
                    id="home_score"
                    type="number"
                    value={formData.home_score}
                    onChange={(e) =>
                      setFormData({ ...formData, home_score: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.home_team_id || !formData.away_team_id || !formData.game_date || saving}
            >
              {saving ? "Saving..." : editingGame ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete game?"
        description={
          deleteTarget
            ? `This permanently removes ${deleteTarget.away_team?.name || "Away"} @ ${deleteTarget.home_team?.name || "Home"} on ${formatDate(deleteTarget.game_date)}, along with all player stats from this game.`
            : ""
        }
        confirmLabel="Delete game"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
