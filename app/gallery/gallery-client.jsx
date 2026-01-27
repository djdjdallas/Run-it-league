"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import { SponsorBanner } from "@/components/sponsor-banner"
import { ImageLightbox } from "@/components/image-lightbox"
import { Camera, Star } from "lucide-react"

const categories = [
  { id: "all", label: "All Photos" },
  { id: "highlights", label: "Highlights" },
  { id: "events", label: "Events" },
  { id: "updates", label: "Updates" },
]

export default function GalleryClient({ photos, sponsors }) {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Filter photos by category
  const filteredPhotos =
    selectedCategory === "all"
      ? photos
      : photos.filter((p) => p.category === selectedCategory)

  // Sort: featured first, then by date
  const sortedPhotos = [...filteredPhotos].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1
    if (!a.is_featured && b.is_featured) return 1
    return new Date(b.created_at) - new Date(a.created_at)
  })

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-500/10 via-background to-background py-8">
          <div className="container">
            <div className="flex items-center gap-3 mb-4">
              <Camera className="h-8 w-8 text-purple-500" />
              <h1 className="text-3xl font-bold tracking-tight">Photo Gallery</h1>
            </div>
            <p className="text-muted-foreground">
              Highlights, events, and moments from the league
            </p>
          </div>
        </section>

        <div className="container py-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Photo Grid */}
          {sortedPhotos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer bg-muted"
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={photo.image_url}
                    alt={photo.title || "Gallery photo"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold truncate">
                        {photo.title || "Untitled"}
                      </h3>
                      {photo.description && (
                        <p className="text-white/70 text-sm truncate">
                          {photo.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Featured Badge */}
                  {photo.is_featured && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-yellow-500 hover:bg-yellow-600">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {photo.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-20 text-center">
                <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">No Photos Yet</h2>
                <p className="text-muted-foreground">
                  Check back later for photos from games and events
                </p>
              </CardContent>
            </Card>
          )}

          {/* Sponsor Banner */}
          <div className="mt-12">
            <SponsorBanner sponsors={sponsors} />
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          photos={sortedPhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={() =>
            setLightboxIndex(
              (prev) => (prev - 1 + sortedPhotos.length) % sortedPhotos.length
            )
          }
          onNext={() =>
            setLightboxIndex((prev) => (prev + 1) % sortedPhotos.length)
          }
        />
      )}

      <Footer />
    </div>
  )
}
