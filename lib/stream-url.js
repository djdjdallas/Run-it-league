// Convert any common stream URL into an embeddable iframe src.
// Pure function — host is passed in (browser hostname for Twitch parent).

export function normalizeStreamUrl(url, type, host = "") {
  if (!url) return null
  const trimmed = String(url).trim()
  if (!trimmed) return null

  const inferred = inferType(trimmed) || type || "custom"

  try {
    if (inferred === "youtube") return normalizeYoutube(trimmed)
    if (inferred === "twitch") return normalizeTwitch(trimmed, host)
    if (inferred === "vimeo") return normalizeVimeo(trimmed)
  } catch {
    return trimmed
  }
  return trimmed
}

export function inferType(url) {
  if (!url) return null
  const u = String(url).toLowerCase()
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube"
  if (u.includes("twitch.tv")) return "twitch"
  if (u.includes("vimeo.com")) return "vimeo"
  return null
}

// Returns { ok, message } describing whether the URL will embed.
export function diagnoseStreamUrl(url, type, host = "") {
  if (!url || !String(url).trim()) {
    return { ok: false, message: "Paste a stream URL to preview." }
  }
  const t = inferType(url) || type
  if (t === "twitch" && !host) {
    return {
      ok: false,
      message: "Twitch needs the page host — preview will render once mounted.",
    }
  }
  if (t === "youtube") {
    const lower = url.toLowerCase()
    if (lower.includes("/@") || lower.includes("/c/") || lower.includes("/user/")) {
      return {
        ok: false,
        message:
          "YouTube @handle / /c/ URLs can't be auto-converted. Use the channel URL (youtube.com/channel/UC…) or a specific watch/live URL.",
      }
    }
  }
  return { ok: true, message: "" }
}

function normalizeYoutube(input) {
  const u = new URL(input)
  if (u.pathname.startsWith("/embed/")) return input

  if (u.hostname.includes("youtu.be")) {
    const id = u.pathname.replace(/^\//, "").split("/")[0]
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : input
  }
  if (u.pathname === "/watch") {
    const id = u.searchParams.get("v")
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : input
  }
  const liveMatch = u.pathname.match(/^\/(live|shorts)\/([\w-]+)/)
  if (liveMatch) {
    return `https://www.youtube.com/embed/${liveMatch[2]}?autoplay=1`
  }
  const channelMatch = u.pathname.match(/^\/channel\/([\w-]+)/)
  if (channelMatch) {
    return `https://www.youtube.com/embed/live_stream?channel=${channelMatch[1]}&autoplay=1`
  }
  return input
}

function normalizeTwitch(input, host) {
  if (!host) return input
  const u = new URL(input)

  if (u.hostname.includes("player.twitch.tv")) {
    u.searchParams.set("parent", host)
    return u.toString()
  }

  const vodMatch = u.pathname.match(/^\/videos\/(\d+)/)
  if (vodMatch) {
    return `https://player.twitch.tv/?video=v${vodMatch[1]}&parent=${host}&autoplay=true`
  }

  const channelMatch = u.pathname.match(/^\/([a-zA-Z0-9_]+)\/?$/)
  if (channelMatch) {
    return `https://player.twitch.tv/?channel=${channelMatch[1]}&parent=${host}&autoplay=true`
  }
  return input
}

function normalizeVimeo(input) {
  const u = new URL(input)
  if (u.hostname.includes("player.vimeo.com")) return input

  const eventMatch = u.pathname.match(/^\/event\/(\d+)/)
  if (eventMatch) {
    return `https://vimeo.com/event/${eventMatch[1]}/embed`
  }
  const idMatch = u.pathname.match(/^\/(\d+)/)
  if (idMatch) {
    const hash = u.searchParams.get("h")
    return hash
      ? `https://player.vimeo.com/video/${idMatch[1]}?h=${hash}`
      : `https://player.vimeo.com/video/${idMatch[1]}`
  }
  return input
}
