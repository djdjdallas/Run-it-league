"use client"

import { useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { formatDate } from "@/lib/utils"

export function ImageLightbox({ photos, currentIndex, onClose, onPrev, onNext }) {
  const currentPhoto = photos[currentIndex]

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") onPrev()
      if (e.key === "ArrowRight") onNext()
    },
    [onClose, onPrev, onNext]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [handleKeyDown])

  if (!currentPhoto) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Navigation - Previous */}
      {photos.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10 h-12 w-12"
          onClick={onPrev}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}

      {/* Main Image */}
      <div className="relative max-w-7xl max-h-[90vh] mx-16">
        <img
          src={currentPhoto.image_url}
          alt={currentPhoto.title || "Gallery photo"}
          className="max-w-full max-h-[80vh] object-contain"
        />

        {/* Photo Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-white text-xl font-semibold">
                {currentPhoto.title || "Untitled"}
              </h2>
              {currentPhoto.description && (
                <p className="text-white/70 mt-1">{currentPhoto.description}</p>
              )}
              <p className="text-white/50 text-sm mt-2">
                {formatDate(currentPhoto.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm">
                {currentIndex + 1} / {photos.length}
              </span>
              <a
                href={currentPhoto.image_url}
                download
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <Download className="h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Next */}
      {photos.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10 h-12 w-12"
          onClick={onNext}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* Thumbnail Strip */}
      {photos.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
          <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-4xl mx-auto">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => {
                  if (index < currentIndex) {
                    for (let i = 0; i < currentIndex - index; i++) onPrev()
                  } else if (index > currentIndex) {
                    for (let i = 0; i < index - currentIndex; i++) onNext()
                  }
                }}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden transition-all ${
                  index === currentIndex
                    ? "ring-2 ring-white scale-110"
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                <img
                  src={photo.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  )
}
