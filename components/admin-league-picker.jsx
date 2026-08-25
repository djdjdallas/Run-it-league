"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronDown, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { selectAdminLeague } from "@/app/admin/league-actions"

// Chooses which league the admin panel edits. Everything downstream --
// list views, and the league stamped onto anything created -- follows this.
export function AdminLeaguePicker({ leagues = [], currentSlug }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  // Nothing to switch between until a second league exists.
  if (leagues.length < 2) return null

  const current = leagues.find((l) => l.slug === currentSlug) || leagues[0]

  const choose = (slug) => {
    setOpen(false)
    if (slug === currentSlug) return
    startTransition(async () => {
      await selectAdminLeague(slug)
      router.refresh()
    })
  }

  return (
    <div className="relative px-4 pt-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
        Editing league
      </p>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "w-full flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
          "hover:bg-muted disabled:opacity-60",
          open && "bg-muted"
        )}
      >
        <Trophy className="h-4 w-4 shrink-0" />
        <span className="truncate flex-1 text-left">
          {current?.short_name || current?.name}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-4 right-4 z-30 mt-1 rounded-md border bg-card shadow-lg overflow-hidden"
        >
          {leagues.map((league) => {
            const isCurrent = league.slug === currentSlug
            return (
              <li key={league.slug}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isCurrent}
                  onClick={() => choose(league.slug)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                    isCurrent ? "bg-muted font-medium" : "hover:bg-muted"
                  )}
                >
                  <Check
                    className={cn("h-3.5 w-3.5 shrink-0", isCurrent ? "opacity-100" : "opacity-0")}
                  />
                  <span className="truncate">{league.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {pending && (
        <p className="text-[10px] text-muted-foreground mt-1.5">Switching...</p>
      )}
    </div>
  )
}
