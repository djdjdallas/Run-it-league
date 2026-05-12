"use client"

import { useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, Camera, FileImage, FileText } from "lucide-react"

export function StatScanner({ onStatsExtracted }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const cameraInputRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleFile = (selectedFile) => {
    if (!selectedFile) return

    const isImage = selectedFile.type.startsWith("image/")
    const isPdf = selectedFile.type === "application/pdf"
    if (!isImage && !isPdf) {
      setError("Please upload an image or PDF file")
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setFile(selectedFile)
    setError(null)

    if (isImage) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(selectedFile)
    } else {
      // PDF — skip image preview
      setPreview(null)
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setError(null)
    if (cameraInputRef.current) cameraInputRef.current.value = ""
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const uploadToStorage = async (f) => {
    const supabase = createClient()
    const ext = f.name?.split(".").pop() || "jpg"
    const fileName = `stat-sheets/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, f, { contentType: f.type || "image/jpeg" })

    if (uploadError) {
      console.error("Stat sheet upload failed:", uploadError)
      return null
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(fileName)
    return publicUrl
  }

  const scanStats = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const reader = new FileReader()
      const base64Promise = new Promise((resolve) => {
        reader.onload = () => {
          const base64 = reader.result.split(",")[1]
          resolve(base64)
        }
      })
      reader.readAsDataURL(file)
      const base64Image = await base64Promise

      const response = await fetch("/api/scan-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          mediaType: file.type,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to scan stats")
      }

      const data = await response.json()

      // Upload the scanned image to storage so it can be attached to the game.
      // Non-blocking: if upload fails, we still return the stats.
      const storageUrl = await uploadToStorage(file)

      onStatsExtracted(data.stats, preview, storageUrl)
    } catch (err) {
      setError(err.message || "Failed to extract stats from image")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          AI Stat Sheet Scanner
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="bg-muted rounded-full p-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium mb-1">
                  Scan a handwritten stat sheet
                </p>
                <p className="text-sm text-muted-foreground">
                  Take a photo or choose a file (JPG, PNG, HEIC, PDF — up to 10MB)
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileImage className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              {preview ? (
                <img
                  src={preview}
                  alt="Stat sheet preview"
                  className="w-full rounded-lg border max-h-96 object-contain bg-muted"
                />
              ) : (
                <div className="w-full rounded-lg border bg-muted p-8 flex items-center gap-4">
                  <FileText className="h-10 w-10 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      PDF — {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={scanStats}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanning Stats...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Extract Stats with AI
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={clearFile} disabled={loading}>
                Clear
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md">
            {error}
          </div>
        )}

        <div className="mt-4 p-4 bg-muted rounded-md">
          <h4 className="font-medium mb-2">Tips for best results:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- Use good lighting when taking the photo</li>
            <li>- Make sure the entire stat sheet is visible</li>
            <li>- Keep the image as straight as possible</li>
            <li>- Standard basketball stat sheet formats work best</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
