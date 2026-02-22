# Run It League — Design System

Dark brutalist street basketball aesthetic. Sharp edges, bold type, neon red accents.

---

## Color Palette

| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Background | `#080808` | `--background` | Page backgrounds |
| Card | `#121212` | `--card` | Cards, elevated surfaces |
| Surface Alt | `#0A0A0A` | — | Alternating section bg |
| Neon Red | `#C92B2A` | `neon` (Tailwind) | Primary accent, CTAs, highlights |
| White | `#F2F2F2` | `--foreground` | Primary text |
| White/60 | `rgba(255,255,255,0.6)` | — | Body text, descriptions |
| White/40 | `rgba(255,255,255,0.4)` | — | Secondary text, labels |
| White/30 | `rgba(255,255,255,0.3)` | — | Tertiary text, copyright |
| White/10 | `rgba(255,255,255,0.1)` | — | Borders, dividers |
| Border | `hsl(0 0% 15%)` | `--border` | Component borders |

## Typography

### Fonts
- **Display**: Tanker (Fontshare) — headings, section titles, logo
- **Body**: Satoshi (Fontshare) — everything else

### Usage
| Style | Font | Size | Weight | Transform |
|-------|------|------|--------|-----------|
| Hero heading | Tanker | `text-6xl` to `text-9xl` | 400 | Uppercase |
| Section heading | Tanker | `text-4xl` to `text-5xl` | 400 | Uppercase |
| Card heading | Tanker | `text-lg` to `text-2xl` | 400 | Uppercase |
| Section label | Satoshi | `text-xs` | 700 | Uppercase, `tracking-[0.3em]` |
| Body text | Satoshi | `text-sm` to `text-lg` | 400-500 | Normal |
| Nav link | Satoshi | `text-sm` | 500 | Normal |
| Button text | Satoshi | `text-sm` | 700 | Uppercase, `tracking-wider` |

### CSS Classes
- `.font-display` — Tanker + uppercase (defined in globals.css)
- `.font-sans` — Satoshi (Tailwind default override)

## Spacing

| Element | Pattern |
|---------|---------|
| Section padding | `py-16 md:py-24` |
| Container | `.container` (centered, `max-w-[1400px]`, `px-8`) |
| Section heading margin | `mb-10` |
| Card padding | `p-5` to `p-6` |
| Grid gap | `gap-4` |
| Stack gap | `space-y-4` |

## Component Patterns

### Buttons
```
<!-- Primary (neon) -->
<a class="bg-neon text-black px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-neon/90 transition-colors">

<!-- Secondary (outline) -->
<a class="border border-white/20 text-white px-8 py-3 font-bold uppercase tracking-wider text-sm hover:border-neon hover:text-neon transition-colors">
```

### Cards
```
<div class="bg-[#121212] border border-white/10 p-6 brutal-hover">
```
No border-radius. Use `brutal-hover` for lift + neon shadow on hover.

### Section Headings
```
<p class="text-neon text-xs font-bold uppercase tracking-[0.3em] mb-2">Label</p>
<h2 class="font-display text-4xl md:text-5xl text-white">HEADING</h2>
```

### "View All" Links
```
<a class="inline-flex items-center gap-2 text-sm text-white/40 hover:text-neon transition-colors">
  Link Text <ArrowRight class="h-4 w-4" />
</a>
```

### Badges/Labels
```
<span class="text-xs text-neon uppercase tracking-wider font-bold">Label</span>
```

## CSS Utility Classes

| Class | Effect |
|-------|--------|
| `.grain-overlay` | Fixed noise texture overlay (3% opacity) |
| `.neon-glow` | Orange text-shadow glow effect |
| `.brutal-hover` | Lift + neon box-shadow on hover |
| `.clip-slant` | Angled clip-path for section edges |
| `.font-display` | Tanker font + uppercase |

## Icons
Use **lucide-react** exclusively. Common sizes: `h-4 w-4` (inline), `h-7 w-7` (feature).

## Responsive Breakpoints

| Breakpoint | Usage |
|-----------|-------|
| Default | Mobile-first (single column) |
| `md:` (768px) | 2-column grids, show desktop nav |
| `lg:` (1024px) | 3-column grids |

### Responsive Patterns
- Grid: `grid md:grid-cols-2 lg:grid-cols-3`
- Typography: `text-4xl md:text-5xl` (scale up)
- Spacing: `py-16 md:py-24` (more space on desktop)
- Show/hide: `hidden md:inline-flex` / `md:hidden`

## Nav Pattern
- Fixed top, `bg-[#080808]/95 backdrop-blur`
- Logo: `font-display` with neon `RUN` box highlight
- Links: `text-white/60 hover:text-neon`, active = `text-neon` + bottom bar
- CTA: `bg-neon text-black` button
- Mobile: hamburger toggle, full-width dark dropdown

## Footer Pattern
- `bg-[#080808] border-t border-white/10`
- 4-column grid: logo/desc, quick links, league, admin
- Section headings: `text-xs font-bold text-white/70 uppercase tracking-wider`
- Links: `text-white/50 hover:text-neon`
- Copyright: `text-white/30`
