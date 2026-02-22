"use client"

import { useState } from "react"
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
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <main className="flex-1">
        {/* Header */}
        <section className="py-16 md:py-24">
          <div className="container">
            <p className="text-neon text-xs font-bold uppercase tracking-[0.3em] mb-2">
              Media
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-white">
              THE GALLERY
            </h1>
          </div>
        </section>

        <div className="container pb-16">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-neon text-black"
                    : "border border-white/20 text-white/60 hover:border-neon hover:text-neon"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Photo Grid */}
          {sortedPhotos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square overflow-hidden cursor-pointer bg-[#121212]"
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
                      <span className="bg-neon text-black text-xs font-bold uppercase px-2 py-1 inline-flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Featured
                      </span>
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-white/10 text-white/60 text-xs capitalize px-2 py-1">
                      {photo.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#121212] border border-white/10 py-20 text-center">
              <Camera className="h-16 w-16 mx-auto mb-4 text-white/20" />
              <h2 className="text-xl font-bold text-white mb-2">No Photos Yet</h2>
              <p className="text-white/40">
                Check back later for photos from games and events
              </p>
            </div>
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
