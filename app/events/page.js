"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import { SponsorBanner } from "@/components/sponsor-banner"
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  ChevronRight,
  CalendarDays,
  Dumbbell,
  Trophy,
  PartyPopper,
} from "lucide-react"
import { sampleEvents } from "@/lib/sample-data"
import { formatDate, formatTime } from "@/lib/utils"

const eventTypeIcons = {
  tryout: Dumbbell,
  training: Dumbbell,
  tournament: Trophy,
  social: PartyPopper,
  meeting: Users,
  general: Calendar,
}

const eventTypeColors = {
  tryout: "bg-blue-500",
  training: "bg-green-500",
  tournament: "bg-yellow-500",
  social: "bg-purple-500",
  meeting: "bg-gray-500",
  general: "bg-primary",
}

export default function EventsPage() {
  const [filter, setFilter] = useState("all")

  // Sort events by start time
  const sortedEvents = [...sampleEvents].sort(
    (a, b) => new Date(a.start_time) - new Date(b.start_time)
  )

  // Filter upcoming vs past
  const now = new Date()
  const upcomingEvents = sortedEvents.filter(
    (e) => new Date(e.start_time) > now
  )
  const pastEvents = sortedEvents.filter((e) => new Date(e.start_time) <= now)

  const displayEvents = filter === "past" ? pastEvents : upcomingEvents

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-500/10 via-background to-background py-8">
          <div className="container">
            <div className="flex items-center gap-3 mb-4">
              <CalendarDays className="h-8 w-8 text-orange-500" />
              <h1 className="text-3xl font-bold tracking-tight">
                Events & Activities
              </h1>
            </div>
            <p className="text-muted-foreground">
              Tryouts, training sessions, tournaments, and more
            </p>
          </div>
        </section>

        <div className="container py-8">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-8">
            <Button
              variant={filter === "upcoming" ? "default" : "outline"}
              onClick={() => setFilter("upcoming")}
            >
              Upcoming ({upcomingEvents.length})
            </Button>
            <Button
              variant={filter === "past" ? "default" : "outline"}
              onClick={() => setFilter("past")}
            >
              Past Events
            </Button>
          </div>

          {/* Events Grid */}
          {displayEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayEvents.map((event) => {
                const Icon = eventTypeIcons[event.event_type] || Calendar
                const colorClass =
                  eventTypeColors[event.event_type] || "bg-primary"
                const spotsLeft = event.max_participants
                  ? event.max_participants - event.current_participants
                  : null
                const isFull = spotsLeft !== null && spotsLeft <= 0

                return (
                  <Card key={event.id} className="overflow-hidden">
                    {/* Color Bar */}
                    <div className={`h-2 ${colorClass}`} />

                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${colorClass} bg-opacity-20`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <Badge variant="outline" className="capitalize mb-1">
                              {event.event_type}
                            </Badge>
                            <h3 className="font-semibold text-lg">
                              {event.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(event.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTime(event.start_time)}
                            {event.end_time &&
                              ` - ${formatTime(event.end_time)}`}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.max_participants && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>
                              {event.current_participants} /{" "}
                              {event.max_participants} registered
                              {spotsLeft !== null && spotsLeft > 0 && (
                                <span className="text-green-600 ml-1">
                                  ({spotsLeft} spots left)
                                </span>
                              )}
                              {isFull && (
                                <span className="text-red-500 ml-1">
                                  (Full)
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        {event.registration_fee > 0 && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span>${event.registration_fee.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      {event.registration_required && filter !== "past" && (
                        <div className="mt-4 pt-4 border-t">
                          <Link href={`/events/${event.id}/register`}>
                            <Button
                              className="w-full"
                              disabled={isFull}
                              variant={isFull ? "outline" : "default"}
                            >
                              {isFull ? "Event Full - Join Waitlist" : "Register Now"}
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-20 text-center">
                <CalendarDays className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">
                  {filter === "past" ? "No Past Events" : "No Upcoming Events"}
                </h2>
                <p className="text-muted-foreground">
                  {filter === "past"
                    ? "Check back for event history"
                    : "Check back later for upcoming events and activities"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* CTA Section */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card className="bg-primary/5">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  Ready to Join the League?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Register now for the upcoming season and be part of the action.
                </p>
                <Link href="/register">
                  <Button>
                    Register Now
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  Want to Host an Event?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Contact us about hosting tournaments, training sessions, or
                  community events.
                </p>
                <Button variant="outline">Contact Us</Button>
              </CardContent>
            </Card>
          </div>

          {/* Sponsor Banner */}
          <div className="mt-12">
            <SponsorBanner />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
