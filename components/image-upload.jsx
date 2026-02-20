"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"

export function ImageUpload({ folder = "general", onUpload, currentUrl, className }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl || null)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB")
      return
    }

    setError(null)
    setUploading(true)

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, file)

    if (uploadError) {
      setError("Upload failed: " + uploadError.message)
      setPreview(currentUrl || null)
      URL.revokeObjectURL(localPreview)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from("images")
      .getPublicUrl(fileName)

    URL.revokeObjectURL(localPreview)
    setPreview(publicUrl)
    setUploading(false)
    onUpload?.(publicUrl)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    onUpload?.("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={className}>
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-40 object-cover rounded-lg border"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
          ) : (
            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {uploading ? "Uploading..." : "Drop an image here or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  )
}
