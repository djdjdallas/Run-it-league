"use client"

// How fast the ticker text should travel, in CSS pixels per second. Low
// enough to actually read a phrase as it passes.
const PX_PER_SECOND = 45

// Rough advance width of one character at text-sm with tracking-wider, plus
// the fixed overhead each item adds (its gap and the "//" separator). Both
// terms matter: with one long item the characters dominate, with many short
// ones the per-item overhead does. Only used to pick a duration, so an
// approximation is fine -- measured within about 5% of real layout.
const PX_PER_CHAR = 8.6
const PX_PER_ITEM = 45

export function MarqueeTicker({ items = [] }) {
  if (items.length === 0) return null

  // The animation duration is derived from the content rather than fixed.
  // A fixed duration means a league with a long ticker scrolls proportionally
  // faster than one with a short ticker -- the AAPI league has sixteen
  // entries against Run It's one, so a shared 12s made it race past unread.
  // Holding pixels-per-second constant instead makes every league read at the
  // same pace.
  const copyChars = items.join("").length
  const copyWidth = copyChars * PX_PER_CHAR + items.length * PX_PER_ITEM
  // The keyframe travels -50% of the strip, which is three of the six copies.
  const durationSeconds = Math.min(
    600,
    Math.max(8, Math.round((copyWidth * 3) / PX_PER_SECOND))
  )

  const content = items.map((item, i) => (
    <span key={i} className="flex items-center gap-4 shrink-0">
      <span className="font-display text-sm tracking-wider">{item}</span>
      <span className="text-black/40 select-none">//</span>
    </span>
  ))

  return (
    <div className="marquee-bar bg-neon overflow-hidden py-3 group">
      <div
        className="flex gap-4 animate-marquee group-hover:[animation-play-state:paused] w-max"
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        {content}
        {content}
        {content}
        {content}
        {content}
        {content}
      </div>
    </div>
  )
}
