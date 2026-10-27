"use client"

// Scroll speed in pixels per second. Kept slow enough to read a full item
// before it leaves the screen.
const SPEED_PX_PER_SEC = 60
// Rough rendered width of one character in the ticker font, plus the "//"
// separator and gaps around each item. Only needs to be close: it sets the
// duration so speed stays steady however many items the ticker carries.
const CHAR_WIDTH_PX = 9
const ITEM_OVERHEAD_PX = 48
const COPIES = 6

export function MarqueeTicker({ items = [] }) {
  if (items.length === 0) return null

  const content = items.map((item, i) => (
    <span key={i} className="flex items-center gap-4 shrink-0">
      <span className="font-display text-sm tracking-wider">{item}</span>
      <span className="text-black/40 select-none">//</span>
    </span>
  ))

  // The keyframes move the track by -50%, i.e. half the copies. A fixed
  // duration would make a long ticker race and a short one crawl, so the
  // duration is derived from the distance travelled instead.
  const copyWidth = items.reduce(
    (sum, item) => sum + String(item).length * CHAR_WIDTH_PX + ITEM_OVERHEAD_PX,
    0
  )
  const durationSec = Math.max(20, Math.round(((COPIES / 2) * copyWidth) / SPEED_PX_PER_SEC))

  return (
    <div className="marquee-bar bg-neon overflow-hidden py-3 group">
      <div
        className="flex animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none w-max"
        style={{ animationDuration: `${durationSec}s` }}
      >
        {Array.from({ length: COPIES }, (_, i) => (
          <div key={i} className="flex gap-4 pr-4 shrink-0" aria-hidden={i > 0 || undefined}>
            {content}
          </div>
        ))}
      </div>
    </div>
  )
}
