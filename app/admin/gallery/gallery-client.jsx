"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Pencil, Trash2, Star, Camera } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { formatDate } from "@/lib/utils"
import { withLeague } from "@/lib/league-path"

const categories = [
  { id: "all", label: "All" },
  { id: "highlights", label: "Highlights" },
  { id: "events", label: "Events" },
  { id: "updates", label: "Updates" },
  { id: "general", label: "General" },
]

export default function GalleryAdminClient({ initialPhotos, leagueId }) {
  const router = useRouter()
  const [photos, setPhotos] = useState(initialPhotos)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState(null)
  const [saving, setSaving] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    category: "general",
    is_featured: false,
  })

  const filteredPhotos =
    categoryFilter === "all"
      ? photos
      : photos.filter((p) => p.category === categoryFilter)

  const sortedPhotos = [...filteredPhotos].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1
    if (!a.is_featured && b.is_featured) return 1
    return new Date(b.created_at) - new Date(a.created_at)
  })

  const openCreateDialog = () => {
    setEditingPhoto(null)
    setFormData({
      title: "",
      description: "",
      image_url: "",
      category: "general",
      is_featured: false,
    })
    setDialogOpen(true)
  }

  const openEditDialog = (photo) => {
    setEditingPhoto(photo)
    setFormData({
      title: photo.title || "",
      description: photo.description || "",
      image_url: photo.image_url,
      category: photo.category || "general",
      is_featured: photo.is_featured,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.image_url) {
      alert("Please upload an image")
      return
    }

    setSaving(true)
    const supabase = createClient()

    if (editingPhoto) {
      const { error } = await supabase
        .from("gallery_photos")
        .update(formData)
        .eq("id", editingPhoto.id)

      if (error) {
        alert("Failed to update photo: " + error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase
        .from("gallery_photos")
        .insert(withLeague(formData, leagueId))

      if (error) {
        alert("Failed to add photo: " + error.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setDialogOpen(false)
    router.refresh()
  }

  const confirmDelete = async () => {
    const photo = deleteTarget
    if (!photo) return

    const prev = photos
    setPhotos(photos.filter((p) => p.id !== photo.id))

    const supabase = createClient()
    const { error } = await supabase
      .from("gallery_photos")
      .delete()
      .eq("id", photo.id)

    if (error) {
      alert("Failed to delete photo: " + error.message)
      setPhotos(prev)
    }
  }

  const toggleFeatured = async (photoId) => {
    const photo = photos.find((p) => p.id === photoId)
    const newFeatured = !photo.is_featured

    const prev = photos
    setPhotos(
      photos.map((p) =>
        p.id === photoId ? { ...p, is_featured: newFeatured } : p
      )
    )

    const supabase = createClient()
    const { error } = await supabase
      .from("gallery_photos")
      .update({ is_featured: newFeatured })
      .eq("id", photoId)

    if (error) {
      alert("Failed to update featured status: " + error.message)
      setPhotos(prev)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
          <p className="text-muted-foreground mt-2">
            Manage photo gallery ({photos.length} photos)
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Photo
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={categoryFilter === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter(cat.id)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Photo Grid */}
      {sortedPhotos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={photo.image_url}
                  alt={photo.title || "Gallery photo"}
                  className="w-full h-full object-cover"
                />
                {photo.is_featured && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-yellow-500 hover:bg-yellow-600">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {photo.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium text-sm truncate">
                  {photo.title || "Untitled"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(photo.created_at)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleFeatured(photo.id)}
                    title={photo.is_featured ? "Unfeature" : "Feature"}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        photo.is_featured ? "text-yellow-500 fill-yellow-500" : ""
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(photo)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setDeleteTarget(photo)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No photos yet.</p>
            <Button className="mt-4" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Photo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPhoto ? "Edit Photo" : "Add Photo"}
            </DialogTitle>
            <DialogDescription>
              {editingPhoto
                ? "Update the photo details below."
                : "Upload a new photo to the gallery."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Image *</Label>
              <ImageUpload
                folder="gallery"
                currentUrl={formData.image_url || undefined}
                onUpload={(url) => setFormData({ ...formData, image_url: url })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Photo title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe this photo..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="general">General</option>
                <option value="highlights">Highlights</option>
                <option value="events">Events</option>
                <option value="updates">Updates</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData({ ...formData, is_featured: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_featured">Featured photo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.image_url || saving}
            >
              {saving ? "Saving..." : editingPhoto ? "Update" : "Add Photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete photo?"
        description={
          deleteTarget
            ? `This permanently removes ${deleteTarget.title ? `"${deleteTarget.title}"` : "this photo"} from the gallery.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
