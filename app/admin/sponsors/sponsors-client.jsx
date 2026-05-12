"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Plus, Pencil, Trash2, ExternalLink, GripVertical } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"

export default function SponsorsClient({ initialSponsors }) {
  const router = useRouter()
  const [sponsors, setSponsors] = useState(initialSponsors)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSponsor, setEditingSponsor] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    website_url: "",
    tier: "standard",
    is_active: true,
  })

  const openCreateDialog = () => {
    setEditingSponsor(null)
    setFormData({
      name: "",
      logo_url: "",
      website_url: "",
      tier: "standard",
      is_active: true,
    })
    setDialogOpen(true)
  }

  const openEditDialog = (sponsor) => {
    setEditingSponsor(sponsor)
    setFormData({
      name: sponsor.name,
      logo_url: sponsor.logo_url || "",
      website_url: sponsor.website_url || "",
      tier: sponsor.tier,
      is_active: sponsor.is_active,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    if (editingSponsor) {
      const { error } = await supabase
        .from("sponsors")
        .update(formData)
        .eq("id", editingSponsor.id)

      if (error) {
        alert("Failed to update sponsor: " + error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase
        .from("sponsors")
        .insert({ ...formData, display_order: sponsors.length })

      if (error) {
        alert("Failed to create sponsor: " + error.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setDialogOpen(false)
    router.refresh()
  }

  const confirmDelete = async () => {
    const sponsor = deleteTarget
    if (!sponsor) return

    const prev = sponsors
    setSponsors(sponsors.filter((s) => s.id !== sponsor.id))

    const supabase = createClient()
    const { error } = await supabase
      .from("sponsors")
      .delete()
      .eq("id", sponsor.id)

    if (error) {
      alert("Failed to delete sponsor: " + error.message)
      setSponsors(prev)
    }
  }

  const toggleActive = async (sponsorId) => {
    const sponsor = sponsors.find((s) => s.id === sponsorId)
    const newActive = !sponsor.is_active

    const prev = sponsors
    setSponsors(
      sponsors.map((s) =>
        s.id === sponsorId ? { ...s, is_active: newActive } : s
      )
    )

    const supabase = createClient()
    const { error } = await supabase
      .from("sponsors")
      .update({ is_active: newActive })
      .eq("id", sponsorId)

    if (error) {
      alert("Failed to update sponsor status: " + error.message)
      setSponsors(prev)
    }
  }

  const sortedSponsors = [...sponsors].sort(
    (a, b) => a.display_order - b.display_order
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sponsors</h1>
          <p className="text-muted-foreground mt-2">
            Manage league sponsors and their visibility
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Sponsor
        </Button>
      </div>

      <div className="grid gap-4">
        {sortedSponsors.map((sponsor) => (
          <Card
            key={sponsor.id}
            className={!sponsor.is_active ? "opacity-60" : ""}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />

                {/* Logo */}
                <div className="w-20 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                  {sponsor.logo_url ? (
                    <img
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No Logo
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{sponsor.name}</h3>
                    <Badge
                      variant={
                        sponsor.tier === "premium" ? "default" : "secondary"
                      }
                    >
                      {sponsor.tier}
                    </Badge>
                    {!sponsor.is_active && (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                  {sponsor.website_url && (
                    <a
                      href={sponsor.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      {sponsor.website_url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(sponsor.id)}
                  >
                    {sponsor.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(sponsor)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(sponsor)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sponsors.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No sponsors yet.</p>
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Sponsor
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSponsor ? "Edit Sponsor" : "Add Sponsor"}
            </DialogTitle>
            <DialogDescription>
              {editingSponsor
                ? "Update sponsor information"
                : "Add a new sponsor to the league"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Sponsor Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Company Name"
              />
            </div>

            <div className="space-y-2">
              <Label>Sponsor Logo</Label>
              <ImageUpload
                folder="sponsors"
                currentUrl={formData.logo_url || undefined}
                onUpload={(url) => setFormData({ ...formData, logo_url: url })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                value={formData.website_url}
                onChange={(e) =>
                  setFormData({ ...formData, website_url: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tier">Sponsor Tier</Label>
              <select
                id="tier"
                value={formData.tier}
                onChange={(e) =>
                  setFormData({ ...formData, tier: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="premium">Premium</option>
                <option value="standard">Standard</option>
                <option value="basic">Basic</option>
              </select>
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
              <Label htmlFor="is_active">Active (visible on site)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || saving}>
              {saving ? "Saving..." : editingSponsor ? "Update" : "Add"} {!saving && "Sponsor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete sponsor?"
        description={
          deleteTarget
            ? `This permanently removes "${deleteTarget.name}" from your sponsor list.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
