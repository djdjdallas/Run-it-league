"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Plus, Pencil, Trash2 } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"

export default function TeamsClient({ initialTeams }) {
  const router = useRouter()
  const [teams, setTeams] = useState(initialTeams)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [blockedDelete, setBlockedDelete] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    logo_url: "",
    primary_color: "#000000",
    secondary_color: "#FFFFFF",
  })

  const openCreateDialog = () => {
    setEditingTeam(null)
    setFormData({
      name: "",
      abbreviation: "",
      logo_url: "",
      primary_color: "#000000",
      secondary_color: "#FFFFFF",
    })
    setDialogOpen(true)
  }

  const openEditDialog = (team) => {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      abbreviation: team.abbreviation || "",
      logo_url: team.logo_url || "",
      primary_color: team.primary_color || "#000000",
      secondary_color: team.secondary_color || "#FFFFFF",
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const data = { ...formData, logo_url: formData.logo_url || null }

    if (editingTeam) {
      const { error } = await supabase
        .from("teams")
        .update(data)
        .eq("id", editingTeam.id)

      if (error) {
        alert("Failed to update team: " + error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase
        .from("teams")
        .insert({ ...data, wins: 0, losses: 0 })

      if (error) {
        alert("Failed to create team: " + error.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setDialogOpen(false)
    router.refresh()
  }

  const confirmDelete = async () => {
    const team = deleteTarget
    if (!team) return

    const supabase = createClient()

    const { count: gameCount, error: gameErr } = await supabase
      .from("games")
      .select("id", { count: "exact", head: true })
      .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)

    if (gameErr) {
      alert("Failed to check team games: " + gameErr.message)
      return
    }

    if (gameCount && gameCount > 0) {
      setDeleteTarget(null)
      setBlockedDelete({ team, gameCount })
      return
    }

    const prev = teams
    setTeams(teams.filter((t) => t.id !== team.id))

    const { error } = await supabase.from("teams").delete().eq("id", team.id)

    if (error) {
      alert("Failed to delete team: " + error.message)
      setTeams(prev)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground mt-2">
            Manage league teams
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Team
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Abbrev</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="text-center">Colors</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>
                    {team.logo_url ? (
                      <img
                        src={team.logo_url}
                        alt={team.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: team.primary_color || "#000" }}
                      >
                        {team.abbreviation?.substring(0, 2) || team.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{team.abbreviation}</TableCell>
                  <TableCell className="text-center">{team.wins}</TableCell>
                  <TableCell className="text-center">{team.losses}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: team.primary_color }}
                        title="Primary"
                      />
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: team.secondary_color }}
                        title="Secondary"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(team)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(team)}
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
              {editingTeam ? "Edit Team" : "Add Team"}
            </DialogTitle>
            <DialogDescription>
              {editingTeam
                ? "Update the team information below."
                : "Enter the details for the new team."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Thunder Hawks"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="abbreviation">Abbreviation</Label>
              <Input
                id="abbreviation"
                value={formData.abbreviation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    abbreviation: e.target.value.toUpperCase(),
                  })
                }
                placeholder="THK"
                maxLength={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Team Logo</Label>
              <ImageUpload
                folder="teams"
                currentUrl={formData.logo_url || undefined}
                onUpload={(url) => setFormData({ ...formData, logo_url: url })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) =>
                      setFormData({ ...formData, primary_color: e.target.value })
                    }
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) =>
                      setFormData({ ...formData, primary_color: e.target.value })
                    }
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) =>
                      setFormData({ ...formData, secondary_color: e.target.value })
                    }
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.secondary_color}
                    onChange={(e) =>
                      setFormData({ ...formData, secondary_color: e.target.value })
                    }
                    placeholder="#FFFFFF"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || saving}>
              {saving ? "Saving..." : editingTeam ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete team?"
        description={
          deleteTarget
            ? `This permanently removes "${deleteTarget.name}". Players assigned to this team will become free agents.`
            : ""
        }
        confirmLabel="Delete team"
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={!!blockedDelete}
        onOpenChange={(v) => !v && setBlockedDelete(null)}
        title="Can't delete this team"
        description={
          blockedDelete
            ? `"${blockedDelete.team.name}" is linked to ${blockedDelete.gameCount} game${blockedDelete.gameCount === 1 ? "" : "s"}. Delete those games first (Admin → Games), then try again.`
            : ""
        }
        confirmLabel="Got it"
        cancelLabel="Close"
        variant="default"
        onConfirm={() => setBlockedDelete(null)}
      />
    </div>
  )
}
