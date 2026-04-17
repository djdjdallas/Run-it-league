"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
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
import { ImageUpload } from "@/components/image-upload"
import {
  Plus,
  Pencil,
  Trash2,
  Radio,
  Video,
  ExternalLink,
  Info,
} from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils"

const streamTypeLabels = {
  youtube: "YouTube",
  twitch: "Twitch",
  vimeo: "Vimeo",
  custom: "Custom",
}

const emptyForm = {
  title: "",
  description: "",
  stream_url: "",
  stream_type: "twitch",
  thumbnail_url: "",
  scheduled_time: "",
  game_id: "",
  is_live: false,
}

export default function StreamsClient({ initialStreams, games }) {
  const router = useRouter()
  const [streams, setStreams] = useState(initialStreams)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStream, setEditingStream] = useState(null)
  const [saving, setSaving] = useState(false)
  const [togglingLive, setTogglingLive] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const openCreateDialog = () => {
    setEditingStream(null)
    setFormData(emptyForm)
    setDialogOpen(true)
  }

  const openEditDialog = (stream) => {
    setEditingStream(stream)
    setFormData({
      title: stream.title || "",
      description: stream.description || "",
      stream_url: stream.stream_url || "",
      stream_type: stream.stream_type || "twitch",
      thumbnail_url: stream.thumbnail_url || "",
      scheduled_time: stream.scheduled_time
        ? new Date(stream.scheduled_time).toISOString().slice(0, 16)
        : "",
      game_id: stream.game_id || "",
      is_live: stream.is_live || false,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title) {
      alert("Please enter a title")
      return
    }

    setSaving(true)
    const supabase = createClient()

    const payload = {
      title: formData.title,
      description: formData.description || null,
      stream_url: formData.stream_url || null,
      stream_type: formData.stream_type,
      thumbnail_url: formData.thumbnail_url || null,
      scheduled_time: formData.scheduled_time
        ? new Date(formData.scheduled_time).toISOString()
        : null,
      game_id: formData.game_id || null,
      is_live: formData.is_live,
    }

    if (editingStream) {
      const { error } = await supabase
        .from("live_streams")
        .update(payload)
        .eq("id", editingStream.id)

      if (error) {
        alert("Failed to update stream: " + error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from("live_streams").insert(payload)

      if (error) {
        alert("Failed to create stream: " + error.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setDialogOpen(false)
    router.refresh()
  }

  const handleDelete = async (streamId) => {
    if (!confirm("Delete this stream?")) return

    const prev = streams
    setStreams(streams.filter((s) => s.id !== streamId))

    const supabase = createClient()
    const { error } = await supabase
      .from("live_streams")
      .delete()
      .eq("id", streamId)

    if (error) {
      alert("Failed to delete stream: " + error.message)
      setStreams(prev)
    } else {
      router.refresh()
    }
  }

  const handleToggleLive = async (stream) => {
    const newValue = !stream.is_live
    setTogglingLive(stream.id)

    const prev = streams
    setStreams(
      streams.map((s) => (s.id === stream.id ? { ...s, is_live: newValue } : s))
    )

    const supabase = createClient()
    const { error } = await supabase
      .from("live_streams")
      .update({ is_live: newValue })
      .eq("id", stream.id)

    setTogglingLive(null)

    if (error) {
      alert("Failed to toggle live status: " + error.message)
      setStreams(prev)
    } else {
      router.refresh()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Streams</h1>
          <p className="text-muted-foreground mt-2">
            Manage streams shown on the public /live page
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Stream
        </Button>
      </div>

      {/* How-to helper */}
      <Card className="mb-6 border-blue-200 bg-blue-50/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm space-y-2">
              <p className="font-medium">Streaming from your phone</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>
                  Install the <strong>Twitch</strong> or <strong>YouTube</strong> app on
                  your phone and start a broadcast.
                </li>
                <li>
                  Create a new stream here and paste the embed URL:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>
                      <span className="font-mono text-xs">
                        https://player.twitch.tv/?channel=YOUR_CHANNEL&amp;parent=YOUR_DOMAIN
                      </span>
                    </li>
                    <li>
                      <span className="font-mono text-xs">
                        https://www.youtube.com/embed/live_stream?channel=CHANNEL_ID
                      </span>
                    </li>
                  </ul>
                </li>
                <li>
                  Toggle <strong>Live</strong> on when you&apos;re broadcasting — it moves
                  the stream to the top of /live with a pulsing indicator.
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Game</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Live?</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {streams.map((stream) => (
                <TableRow key={stream.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {stream.is_live && (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded">
                          <Radio className="h-2.5 w-2.5" />
                          Live
                        </span>
                      )}
                      <span>{stream.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {stream.game
                      ? `${stream.game.home_team?.abbreviation || "?"} vs ${
                          stream.game.away_team?.abbreviation || "?"
                        }`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {streamTypeLabels[stream.stream_type] || stream.stream_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {stream.scheduled_time
                      ? `${formatDate(stream.scheduled_time)} ${formatTime(
                          stream.scheduled_time
                        )}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={stream.is_live ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleLive(stream)}
                      disabled={togglingLive === stream.id}
                    >
                      <Radio className="h-3 w-3 mr-1" />
                      {stream.is_live ? "Live" : "Off"}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {stream.stream_url && (
                        <a
                          href={stream.stream_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open stream URL"
                        >
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(stream)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(stream.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {streams.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <Video className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No streams yet. Click &quot;New Stream&quot; to add one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStream ? "Edit Stream" : "New Stream"}
            </DialogTitle>
            <DialogDescription>
              {editingStream
                ? "Update the stream details."
                : "Add a new stream to appear on the public /live page."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g., Thunder Hawks vs Street Kings — Week 3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Short description shown next to the player"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stream_type">Source</Label>
                <Select
                  id="stream_type"
                  value={formData.stream_type}
                  onChange={(e) => updateField("stream_type", e.target.value)}
                >
                  <option value="twitch">Twitch</option>
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="custom">Custom</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="game_id">Linked Game (optional)</Label>
                <Select
                  id="game_id"
                  value={formData.game_id}
                  onChange={(e) => updateField("game_id", e.target.value)}
                >
                  <option value="">None</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.home_team?.abbreviation || "?"} vs{" "}
                      {game.away_team?.abbreviation || "?"} —{" "}
                      {formatDate(game.game_date)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stream_url">Embed URL *</Label>
              <Input
                id="stream_url"
                value={formData.stream_url}
                onChange={(e) => updateField("stream_url", e.target.value)}
                placeholder="https://player.twitch.tv/?channel=...&parent=..."
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Twitch: use{" "}
                <span className="font-mono">
                  player.twitch.tv/?channel=X&amp;parent=your-domain.com
                </span>
                . YouTube: use{" "}
                <span className="font-mono">
                  youtube.com/embed/live_stream?channel=CHANNEL_ID
                </span>
                .
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_time">Scheduled Time (optional)</Label>
              <Input
                id="scheduled_time"
                type="datetime-local"
                value={formData.scheduled_time}
                onChange={(e) => updateField("scheduled_time", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Thumbnail (optional)</Label>
              <ImageUpload
                folder="streams"
                currentUrl={formData.thumbnail_url || null}
                onUpload={(url) => updateField("thumbnail_url", url)}
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="is_live"
                checked={formData.is_live}
                onChange={(e) => updateField("is_live", e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_live" className="cursor-pointer">
                Mark as live right now (shows pulsing LIVE badge on /live)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.title}>
              {saving
                ? "Saving..."
                : editingStream
                ? "Update Stream"
                : "Create Stream"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
