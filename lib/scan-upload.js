// Client-side helpers for sending a stat sheet to /api/scan-stats.
//
// Why this exists: Vercel rejects serverless request bodies over 4.5MB with a
// plain-text "Request Entity Too Large" (413). Phone photos are often 3-6MB,
// and base64 adds ~33%, so raw uploads blew past the limit. Claude also
// downscales images larger than ~1568px on the long edge, so sending a
// full-resolution photo buys no accuracy. We resize + recompress in the
// browser first, which keeps the payload well under the limit.

// Long edge in px. A bit above Claude's internal size so nothing is lost.
const MAX_EDGE = 2000
// Keep the base64 payload comfortably below Vercel's 4.5MB body cap.
const MAX_BASE64_BYTES = 3.5 * 1024 * 1024
// A PDF can't be recompressed here, so cap its raw size (base64 inflates ~4/3).
export const MAX_PDF_BYTES = Math.floor(MAX_BASE64_BYTES * 0.75)

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    // Browsers apply EXIF orientation to <img> by default, so portrait phone
    // photos come out upright when drawn to the canvas.
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(
        new Error(
          "Couldn't read this image. Try a JPG or PNG (iPhone HEIC photos may need converting)."
        )
      )
    }
    img.src = url
  })
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(",")[1])
    reader.onerror = () => reject(new Error("Couldn't read the file"))
    reader.readAsDataURL(file)
  })
}

// Returns { image, mediaType } ready to POST. Throws a user-readable Error.
export async function prepareScanPayload(file) {
  if (file.type === "application/pdf") {
    if (file.size > MAX_PDF_BYTES) {
      const mb = (MAX_PDF_BYTES / 1024 / 1024).toFixed(1)
      throw new Error(
        `PDF is too large (max ${mb}MB). Export a single page, or upload a photo instead.`
      )
    }
    return { image: await fileToBase64(file), mediaType: "application/pdf" }
  }

  const img = await loadImage(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext("2d")
  // White fill so transparent PNGs don't turn black when encoded as JPEG.
  ctx.fillStyle = "#fff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  // Step quality down until it fits. Pen marks stay legible well below 0.85.
  for (const quality of [0.85, 0.75, 0.65, 0.5]) {
    const base64 = canvas.toDataURL("image/jpeg", quality).split(",")[1]
    if (base64.length <= MAX_BASE64_BYTES) {
      return { image: base64, mediaType: "image/jpeg" }
    }
  }
  throw new Error("Image is too large to process. Try a smaller photo.")
}

// POSTs to the scan API and always returns parsed stats or throws a readable
// Error. Never assumes the response is JSON: platform errors (413, 504
// timeouts) come back as plain text or HTML.
export async function requestScan(payload) {
  const res = await fetch("/api/scan-stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  let data = null
  try {
    data = JSON.parse(text)
  } catch {
    // Non-JSON body; handled below.
  }

  if (!res.ok) {
    if (res.status === 413) {
      throw new Error("File is too large to upload. Try a smaller photo.")
    }
    if (res.status === 504) {
      throw new Error("The scan timed out. Try again, or use a clearer photo.")
    }
    throw new Error(data?.error || `Scan failed (HTTP ${res.status})`)
  }
  if (!data) throw new Error("Unexpected response from the scan service")
  return data
}
