"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/teams", label: "Teams" },
  { href: "/schedule", label: "Schedule" },
  { href: "/stats", label: "Stats" },
  { href: "/live", label: "Live" },
  { href: "/gallery", label: "Gallery" },
  { href: "/events", label: "Events" },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (pathname.startsWith("/admin")) {
    return null
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <header className="w-full bg-[#080808]/95 backdrop-blur border-b border-white/10">
          <div className="container flex h-16 items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mr-8">
              <span className="font-display text-xl tracking-tight">
                <span className="bg-neon text-black px-1.5 py-0.5 inline-block">RUN IT</span>
                <span className="text-white ml-1">LEAGUE</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative py-1 transition-colors",
                    pathname === link.href
                      ? "text-neon"
                      : "text-white/60 hover:text-neon"
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-neon" />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex-1" />

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/register"
                className="bg-neon text-black px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-neon/90 transition-colors"
              >
                Register
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white/60 hover:text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors py-1",
                      pathname === link.href
                        ? "text-neon"
                        : "text-white/60 hover:text-neon"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/register"
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
      {/* Spacer */}
      <div className="h-16" />
    </>
  )
}
