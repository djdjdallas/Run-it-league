// A Hokusai-style cresting wave, drawn as scalable inline SVG in the
// league's own palette. Decorative only, so it is hidden from assistive
// technology.
//
// Built rather than shipped as an image: it stays sharp at any width, costs
// no request, and picks up --neon-2 / --neon-3 like the rest of the skin.
export function WaveCrest({ className = "" }) {
  return (
    <svg
      viewBox="0 0 1440 420"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{
        // Feather the top edge: the wave sits at the foot of the hero and
        // must never collide with the text above it.
        maskImage: "linear-gradient(to bottom, transparent 0%, black 42%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 42%)",
      }}
    >
      <defs>
        <linearGradient id="wc-deep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--neon-2))" stopOpacity="0.95" />
          <stop offset="100%" stopColor="rgb(var(--neon-2))" stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id="wc-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--neon-2))" stopOpacity="0.55" />
          <stop offset="100%" stopColor="rgb(var(--neon-2))" stopOpacity="0.30" />
        </linearGradient>
      </defs>

      {/* far swell */}
      <path
        fill="url(#wc-mid)"
        d="M0,300 C 160,250 300,268 430,296 C 560,324 660,342 790,330
           C 920,318 1040,282 1180,272 C 1300,264 1380,276 1440,292
           L1440,420 L0,420 Z"
      />

      {/* the great wave: rises left, curls right over its own trough */}
      <path
        fill="url(#wc-deep)"
        d="M0,352 C 90,344 150,300 214,238 C 286,168 372,112 470,116
           C 566,120 628,170 660,232 C 690,290 686,338 654,372
           C 700,342 726,296 720,240 C 762,286 780,340 776,392
           L776,420 L0,420 Z"
      />

      {/* foam crest along the curl */}
      <path
        fill="rgb(var(--paper, 240 234 216))"
        opacity="0.92"
        d="M214,238 C 286,168 372,112 470,116 C 528,118 574,138 606,170
           C 566,146 520,136 474,140 C 396,146 322,190 258,254
           C 240,272 226,288 214,302 Z"
      />

      {/* claw-like foam fingers, the motif's signature */}
      <g fill="rgb(var(--paper, 240 234 216))" opacity="0.85">
        <path d="M470,116 c 18,-16 40,-22 62,-16 -20,4 -36,14 -48,28 -6,7 -11,10 -14,8 -3,-2 -3,-11 0,-20 Z" />
        <path d="M540,140 c 22,-10 44,-10 64,2 -22,-2 -42,4 -58,16 -8,6 -14,7 -16,4 -2,-4 2,-16 10,-22 Z" />
        <path d="M392,152 c 20,-18 44,-28 68,-28 -22,8 -42,22 -58,40 -7,8 -13,11 -16,8 -3,-4 -1,-13 6,-20 Z" />
        <path d="M320,206 c 16,-20 38,-34 60,-40 -20,12 -37,28 -50,48 -6,9 -12,13 -15,10 -3,-3 -1,-11 5,-18 Z" />
      </g>

      {/* gold hairline riding the crest -- the tapa thread */}
      <path
        fill="none"
        stroke="rgb(var(--neon-3))"
        strokeOpacity="0.55"
        strokeWidth="2"
        d="M0,352 C 90,344 150,300 214,238 C 286,168 372,112 470,116
           C 566,120 628,170 660,232"
      />
    </svg>
  )
}
