"use client"

export function MarqueeTicker({ items = [] }) {
  if (items.length === 0) return null

  const content = items.map((item, i) => (
    <span key={i} className="flex items-center gap-4 shrink-0">
      <span className="font-display text-sm tracking-wider">{item}</span>
      <span className="text-black/40 select-none">//</span>
    </span>
  ))

  return (
    <div className="marquee-bar bg-neon overflow-hidden py-3 group">
      <div className="flex gap-4 animate-marquee group-hover:[animation-play-state:paused] w-max">
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
