"use client"

import { useState } from "react"
import Link from "next/link"
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
  tryout: "bg-blue-500/20",
  training: "bg-green-500/20",
  tournament: "bg-yellow-500/20",
  social: "bg-purple-500/20",
  meeting: "bg-gray-500/20",
  general: "bg-neon/20",
}

const eventTypeBarColors = {
  tryout: "bg-blue-500/60",
  training: "bg-green-500/60",
  tournament: "bg-yellow-500/60",
  social: "bg-purple-500/60",
  meeting: "bg-gray-500/60",
  general: "bg-neon/60",
}

export default function EventsClient({ events, sponsors }) {
  const [filter, setFilter] = useState("upcoming")

  // Sort events by start time
  const sortedEvents = [...events].sort(
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
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <main className="flex-1">
        {/* Header */}
        <section className="py-16 md:py-24">
          <div className="container">
            <p className="text-neon text-xs font-bold uppercase tracking-[0.3em] mb-2">
              Upcoming
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-white">
              EVENTS
            </h1>
          </div>
        </section>

        <div className="container pb-16">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                filter === "upcoming"
                  ? "bg-neon text-black"
                  : "border border-white/20 text-white/60 hover:border-neon hover:text-neon"
              }`}
            >
              Upcoming ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                filter === "past"
                  ? "bg-neon text-black"
                  : "border border-white/20 text-white/60 hover:border-neon hover:text-neon"
              }`}
            >
              Past Events
            </button>
          </div>

          {/* Events Grid */}
          {displayEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayEvents.map((event) => {
                const Icon = eventTypeIcons[event.event_type] || Calendar
                const colorClass =
                  eventTypeColors[event.event_type] || "bg-neon/20"
                const barColorClass =
                  eventTypeBarColors[event.event_type] || "bg-neon/60"
                const spotsLeft = event.max_participants
                  ? event.max_participants - event.current_participants
                  : null
                const isFull = spotsLeft !== null && spotsLeft <= 0

                return (
                  <div key={event.id} className="bg-[#121212] border border-white/10 overflow-hidden">
                    {/* Color Bar */}
                    <div className={`h-1 ${barColorClass}`} />

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 ${colorClass}`}>
                            <Icon className="h-5 w-5 text-white/60" />
                          </div>
                          <div>
                            <span className="border border-white/20 text-white/60 text-xs capitalize px-2 py-0.5 inline-block mb-1">
                              {event.event_type}
                            </span>
                            <h3 className="font-bold text-white text-lg">
                              {event.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {event.description && (
                        <p className="text-sm text-white/40 mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-white/40">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(event.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/40">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTime(event.start_time)}
                            {event.end_time &&
                              ` - ${formatTime(event.end_time)}`}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-white/40">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.max_participants && (
                          <div className="flex items-center gap-2 text-white/40">
                            <Users className="h-4 w-4" />
                            <span>
                              {event.current_participants} /{" "}
                              {event.max_participants} registered
                              {spotsLeft !== null && spotsLeft > 0 && (
                                <span className="text-neon ml-1">
                                  ({spotsLeft} spots left)
                                </span>
                              )}
                              {isFull && (
                                <span className="text-neon ml-1">
                                  (Full)
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        {event.registration_fee > 0 && (
                          <div className="flex items-center gap-2 text-white/40">
                            <DollarSign className="h-4 w-4" />
                            <span>${event.registration_fee.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      {event.registration_required && filter !== "past" && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <Link href={`/events/${event.id}/register`}>
                            <button
                              disabled={isFull}
                              className={`w-full py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                                isFull
                                  ? "border border-white/20 text-white/40 cursor-not-allowed"
                                  : "bg-neon text-black hover:bg-neon/90"
                              }`}
                            >
                              {isFull ? "Event Full - Join Waitlist" : "Register Now"}
                              <ChevronRight className="h-4 w-4 ml-1 inline" />
                            </button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-[#121212] border border-white/10 py-20 text-center">
              <CalendarDays className="h-16 w-16 mx-auto mb-4 text-white/20" />
              <h2 className="text-xl font-bold text-white mb-2">
                {filter === "past" ? "No Past Events" : "No Upcoming Events"}
              </h2>
              <p className="text-white/40">
                {filter === "past"
                  ? "Check back for event history"
                  : "Check back later for upcoming events and activities"}
              </p>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="bg-neon/5 border border-neon/20 p-6">
              <h3 className="text-xl font-bold text-white mb-2">
                Ready to Join the League?
              </h3>
              <p className="text-white/40 mb-4">
                Register now for the upcoming season and be part of the action.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-1 bg-neon text-black px-6 py-3 font-bold uppercase tracking-wider text-sm hover:bg-neon/90 transition-colors"
              >
                Register Now
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="bg-[#121212] border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-2">
                Want to Host an Event?
              </h3>
              <p className="text-white/40 mb-4">
                Contact us about hosting tournaments, training sessions, or
                community events.
              </p>
              <button className="border border-white/20 text-white px-6 py-3 font-bold uppercase tracking-wider text-sm hover:border-neon hover:text-neon transition-colors">
                Contact Us
              </button>
            </div>
          </div>

          {/* Sponsor Banner */}
          <div className="mt-12">
            <SponsorBanner sponsors={sponsors} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
