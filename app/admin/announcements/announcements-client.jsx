"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Pin } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function AnnouncementsClient({ initialAnnouncements }) {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    is_pinned: false,
  })

  const openCreateDialog = () => {
    setEditingAnnouncement(null)
    setFormData({
      title: "",
      content: "",
      is_pinned: false,
    })
    setDialogOpen(true)
  }

  const openEditDialog = (announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content || "",
      is_pinned: announcement.is_pinned,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    if (editingAnnouncement) {
      const { error } = await supabase
        .from("announcements")
        .update(formData)
        .eq("id", editingAnnouncement.id)

      if (error) {
        alert("Failed to update announcement: " + error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase
        .from("announcements")
        .insert(formData)

      if (error) {
        alert("Failed to create announcement: " + error.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setDialogOpen(false)
    router.refresh()
  }

  const handleDelete = async (announcementId) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return

    const prev = announcements
    setAnnouncements(announcements.filter((a) => a.id !== announcementId))

    const supabase = createClient()
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", announcementId)

    if (error) {
      alert("Failed to delete announcement: " + error.message)
      setAnnouncements(prev)
    }
  }

  const togglePin = async (announcementId) => {
    const announcement = announcements.find((a) => a.id === announcementId)
    const newPinned = !announcement.is_pinned

    const prev = announcements
    setAnnouncements(
      announcements.map((a) =>
        a.id === announcementId ? { ...a, is_pinned: newPinned } : a
      )
    )

    const supabase = createClient()
    const { error } = await supabase
      .from("announcements")
      .update({ is_pinned: newPinned })
      .eq("id", announcementId)

    if (error) {
      alert("Failed to update pin status: " + error.message)
      setAnnouncements(prev)
    }
  }

  // Sort: pinned first, then by date
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-2">
            Manage league announcements
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      <div className="space-y-4">
        {sortedAnnouncements.map((announcement) => (
          <Card key={announcement.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">
                      {announcement.title}
                    </h3>
                    {announcement.is_pinned && (
                      <Badge variant="secondary">
                        <Pin className="h-3 w-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {formatDate(announcement.created_at)}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePin(announcement.id)}
                    title={announcement.is_pinned ? "Unpin" : "Pin"}
                  >
                    <Pin
                      className={`h-4 w-4 ${
                        announcement.is_pinned ? "text-primary" : ""
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(announcement)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedAnnouncements.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No announcements yet.</p>
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Announcement
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
              {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
            </DialogTitle>
            <DialogDescription>
              {editingAnnouncement
                ? "Update the announcement below."
                : "Create a new announcement to share with the league."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Announcement title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Write your announcement..."
                rows={5}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_pinned"
                checked={formData.is_pinned}
                onChange={(e) =>
                  setFormData({ ...formData, is_pinned: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_pinned">Pin this announcement</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.title || saving}>
              {saving ? "Saving..." : editingAnnouncement ? "Update" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
