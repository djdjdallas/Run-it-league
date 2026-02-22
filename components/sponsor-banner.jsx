"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export function SponsorBanner({ sponsors = [], variant = "default", showTitle = true }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const activeSponsors = sponsors.filter((s) => s.is_active)
  const premiumSponsors = activeSponsors.filter((s) => s.tier === "premium")
  const standardSponsors = activeSponsors.filter((s) => s.tier !== "premium")

  // Rotate sponsors every 5 seconds
  useEffect(() => {
    if (variant === "rotating" && activeSponsors.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activeSponsors.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [variant, activeSponsors.length])

  if (activeSponsors.length === 0) return null

  // Rotating single sponsor
  if (variant === "rotating") {
    const sponsor = activeSponsors[currentIndex]
    return (
      <div className="text-center">
        {showTitle && (
          <p className="text-xs text-muted-foreground mb-2">Sponsored by</p>
        )}
        <a
          href={sponsor.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block transition-opacity hover:opacity-80"
        >
          {sponsor.logo_url ? (
            <img
              src={sponsor.logo_url}
              alt={sponsor.name}
              className="h-24 object-contain mx-auto"
            />
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              {sponsor.name}
            </span>
          )}
        </a>
      </div>
    )
  }

  // Compact banner
  if (variant === "compact") {
    return (
      <div className="flex items-center justify-center gap-6 py-2">
        {showTitle && (
          <span className="text-xs text-muted-foreground">Our Sponsors:</span>
        )}
        {activeSponsors.slice(0, 4).map((sponsor) => (
          <a
            key={sponsor.id}
            href={sponsor.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
          >
            {sponsor.logo_url ? (
              <img
                src={sponsor.logo_url}
                alt={sponsor.name}
                className="h-16 object-contain grayscale hover:grayscale-0 transition-all"
              />
            ) : (
              <span className="text-xs font-medium text-muted-foreground hover:text-foreground">
                {sponsor.name}
              </span>
            )}
          </a>
        ))}
      </div>
    )
  }

  // Default full banner
  return (
    <Card>
      <CardContent className="py-8">
        {showTitle && (
          <h3 className="text-center text-lg font-semibold text-muted-foreground mb-6">
            Our Sponsors
          </h3>
        )}

        {/* Premium Sponsors */}
        {premiumSponsors.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-12 mb-8">
            {premiumSponsors.map((sponsor) => (
              <a
                key={sponsor.id}
                href={sponsor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105"
              >
                {sponsor.logo_url ? (
                  <img
                    src={sponsor.logo_url}
                    alt={sponsor.name}
                    className="h-28 object-contain"
                  />
                ) : (
                  <div className="px-6 py-3 bg-muted rounded-lg">
                    <span className="font-semibold text-lg">{sponsor.name}</span>
                  </div>
                )}
              </a>
            ))}
          </div>
        )}

        {/* Standard Sponsors */}
        {standardSponsors.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-10">
            {standardSponsors.map((sponsor) => (
              <a
                key={sponsor.id}
                href={sponsor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
              >
                {sponsor.logo_url ? (
                  <img
                    src={sponsor.logo_url}
                    alt={sponsor.name}
                    className="h-20 object-contain grayscale hover:grayscale-0 transition-all"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 bg-muted/50 rounded">
                    {sponsor.name}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Sidebar sponsor widget
export function SponsorSidebar({ sponsors = [] }) {
  const activeSponsors = sponsors.filter((s) => s.is_active)

  if (activeSponsors.length === 0) return null

  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs text-muted-foreground text-center mb-4">
          Supported By
        </p>
        <div className="space-y-4">
          {activeSponsors.map((sponsor) => (
            <a
              key={sponsor.id}
              href={sponsor.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center transition-opacity hover:opacity-80"
            >
              {sponsor.logo_url ? (
                <img
                  src={sponsor.logo_url}
                  alt={sponsor.name}
                  className="h-20 object-contain mx-auto"
                />
              ) : (
                <span className="text-sm font-medium">{sponsor.name}</span>
              )}
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
