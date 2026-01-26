"use client"

import { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { samplePlayers, sampleTeams } from "@/lib/sample-data"

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState(samplePlayers)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [teamFilter, setTeamFilter] = useState("all")
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    position: "PG",
    height: "",
    team_id: "",
    is_active: true,
  })

  const positions = ["PG", "SG", "SF", "PF", "C"]

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesTeam =
      teamFilter === "all" || player.team_id === teamFilter
    return matchesSearch && matchesTeam
  })

  const openCreateDialog = () => {
    setEditingPlayer(null)
    setFormData({
      name: "",
      number: "",
      position: "PG",
      height: "",
      team_id: "",
      is_active: true,
    })
    setDialogOpen(true)
  }

  const openEditDialog = (player) => {
    setEditingPlayer(player)
    setFormData({
      name: player.name,
      number: player.number?.toString() || "",
      position: player.position || "PG",
      height: player.height || "",
      team_id: player.team_id || "",
      is_active: player.is_active,
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    const playerData = {
      ...formData,
      number: formData.number ? parseInt(formData.number) : null,
    }

    if (editingPlayer) {
      setPlayers(
        players.map((p) =>
          p.id === editingPlayer.id ? { ...p, ...playerData } : p
        )
      )
    } else {
      const newPlayer = {
        id: `player-${Date.now()}`,
        ...playerData,
        photo_url: null,
      }
      setPlayers([...players, newPlayer])
    }
    setDialogOpen(false)
  }

  const handleDelete = (playerId) => {
    if (confirm("Are you sure you want to delete this player?")) {
      setPlayers(players.filter((p) => p.id !== playerId))
    }
  }

  const getTeamName = (teamId) => {
    const team = sampleTeams.find((t) => t.id === teamId)
    return team?.name || "Free Agent"
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Players</h1>
          <p className="text-muted-foreground mt-2">
            Manage league players
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Player
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="all">All Teams</option>
          {sampleTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">Position</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Height</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{player.number}</TableCell>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {getTeamName(player.team_id)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{player.position}</Badge>
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    {player.height || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={player.is_active ? "success" : "secondary"}>
                      {player.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(player)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(player.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPlayer ? "Edit Player" : "Add Player"}
            </DialogTitle>
            <DialogDescription>
              {editingPlayer
                ? "Update the player information below."
                : "Enter the details for the new player."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Player Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Smith"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Jersey Number</Label>
                <Input
                  id="number"
                  type="number"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                  placeholder="23"
                  min="0"
                  max="99"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select
                  id="position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                >
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value })
                  }
                  placeholder="6'2&quot;"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team_id">Team</Label>
                <Select
                  id="team_id"
                  value={formData.team_id}
                  onChange={(e) =>
                    setFormData({ ...formData, team_id: e.target.value })
                  }
                >
                  <option value="">Free Agent</option>
                  {sampleTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_active">Active Player</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name}>
              {editingPlayer ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
