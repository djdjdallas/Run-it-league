"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useLeague } from "@/components/use-league"
import { splitWordmark } from "@/lib/league-path"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/teams", label: "Teams" },
  { href: "/schedule", label: "Schedule" },
  { href: "/stats", label: "Stats" },
  { href: "/live", label: "Live" },
  { href: "/gallery", label: "Gallery" },
  { href: "/events", label: "Events" },
]

// Switching leagues keeps you in the same section but drops any entity id --
// team 123 in one league does not exist in the other, so carrying the full
// path across would land on a guaranteed 404.
function sectionOf(path) {
  const [, first] = (path || "/").split("/")
  return first ? `/${first}` : "/"
}

export function Header({ leagues = [] }) {
  const pathname = usePathname()
  const { slug, path, lp } = useLeague()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (pathname.startsWith("/admin")) {
    return null
  }

  const currentSlug = slug || leagues.find((l) => l.is_default)?.slug
  const showSwitcher = leagues.length > 1
  const section = sectionOf(path)

  const leagueHref = (league) =>
    league.is_default ? section : `/l/${league.slug}${section === "/" ? "" : section}`

  const activeLeague = leagues.find((l) => l.slug === currentSlug)
  const { head: wordmarkHead, tail: wordmarkTail } = splitWordmark(
    activeLeague?.theme?.wordmark || "RUN IT LEAGUE"
  )

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* ===== LEAGUE SWITCHER ===== */}
        {showSwitcher && (
          <div className="w-full bg-black border-b border-white/10">
            <div className="container flex items-center gap-1 h-9">
              <span className="hidden sm:block text-white/30 text-[10px] uppercase tracking-[0.2em] mr-3">
                League
              </span>
              {leagues.map((league) => {
                const isActive = league.slug === currentSlug
                return (
                  <Link
                    key={league.slug}
                    href={leagueHref(league)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors",
                      isActive
                        ? "bg-neon text-black"
                        : "text-white/40 hover:text-white"
                    )}
                  >
                    {league.short_name || league.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        <header className="w-full bg-[#080808]/95 backdrop-blur border-b border-white/10">
          <div className="container flex h-16 items-center">
            {/* Logo */}
            <Link href={lp("/")} className="flex items-center gap-2 mr-8">
              <span className="font-display text-xl tracking-tight">
                <span className="bg-neon text-black px-1.5 py-0.5 inline-block">
                  {wordmarkHead}
                </span>
                {wordmarkTail && (
                  <span className="text-white ml-1">{wordmarkTail}</span>
                )}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navLinks.map((link) => {
                const isActive = path === link.href
                return (
                  <Link
                    key={link.href}
                    href={lp(link.href)}
                    className={cn(
                      "relative py-1 transition-colors",
                      isActive ? "text-neon" : "text-white/60 hover:text-neon"
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-neon" />
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className="flex-1" />

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href={lp("/register")}
                className="bg-neon text-black px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-neon/90 transition-colors"
              >
                Register
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white/60 hover:text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 bg-[#080808]">
              <nav className="container py-4 flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={lp(link.href)}
                    className={cn(
                      "text-sm font-medium transition-colors py-1",
                      path === link.href
                        ? "text-neon"
                        : "text-white/60 hover:text-neon"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href={lp("/register")}
                  className="bg-neon text-black px-4 py-2 text-sm font-bold uppercase tracking-wider text-center mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </nav>
            </div>
          )}
        </header>
      </div>
      {/* Spacer matching the fixed bar: 64px nav, plus 36px switcher strip */}
      <div className={showSwitcher ? "h-[100px]" : "h-16"} />
    </>
  )
}
