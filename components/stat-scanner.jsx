"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, Camera, FileImage } from "lucide-react"

export function StatScanner({ onStatsExtracted }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = (selectedFile) => {
    if (!selectedFile) return

    // Validate file type
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setFile(selectedFile)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    const droppedFile = e.dataTransfer.files[0]
    handleFile(droppedFile)
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
  }

  const scanStats = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      // Convert file to base64
      const reader = new FileReader()
      const base64Promise = new Promise((resolve) => {
        reader.onload = () => {
          const base64 = reader.result.split(",")[1]
          resolve(base64)
        }
      })
      reader.readAsDataURL(file)
      const base64Image = await base64Promise

      // Send to API
      const response = await fetch("/api/scan-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      onStatsExtracted(data.stats, preview)
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
        {!preview ? (
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
                  Drop stat sheet image here or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports JPG, PNG, HEIC up to 10MB
                </p>
              </div>
              <div className="flex gap-2">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                    <FileImage className="h-4 w-4 mr-2" />
                    Choose File
                  </span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview}
                alt="Stat sheet preview"
                className="w-full rounded-lg border max-h-96 object-contain bg-muted"
              />
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
