"use client"

import { useState } from "react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { SponsorBanner } from "@/components/sponsor-banner"
import { Video, Calendar, Radio, Play, Clock, ChevronRight } from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils"

export default function LiveClient({ streams, sponsors }) {
  const [selectedStream, setSelectedStream] = useState(null)

  const liveStreams = streams.filter((s) => s.is_live)
  const upcomingStreams = streams.filter((s) => !s.is_live)

  // Get the featured/active stream
  const activeStream = selectedStream || liveStreams[0] || upcomingStreams[0]

  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <main className="flex-1">
        {/* Header */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-neon text-xs font-bold uppercase tracking-[0.3em] mb-2">
                  Watch
                </p>
                <h1 className="font-display text-4xl md:text-5xl text-white">
                  LIVE GAMES
                </h1>
              </div>
              {liveStreams.length > 0 && (
                <span className="bg-neon text-black text-xs font-bold uppercase px-3 py-1 animate-pulse self-end mb-1">
                  <Radio className="h-3 w-3 mr-1 inline" />
                  LIVE NOW
                </span>
              )}
            </div>
          </div>
        </section>

        <div className="container pb-16">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Video Player */}
            <div className="lg:col-span-2">
              {activeStream ? (
                <div className="bg-[#121212] border border-white/10">
                  {/* Video Embed */}
                  <div className="aspect-video bg-black overflow-hidden">
                    {activeStream.is_live || selectedStream ? (
                      <iframe
                        src={activeStream.stream_url}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gradient-to-br from-gray-800 to-gray-900">
                        {activeStream.thumbnail_url ? (
                          <div className="relative w-full h-full">
                            <img
                              src={activeStream.thumbnail_url}
                              alt={activeStream.title}
                              className="w-full h-full object-cover opacity-50"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <Clock className="h-12 w-12 mb-4 text-white/80" />
                              <p className="text-lg font-medium">Stream starts</p>
                              <p className="text-2xl font-bold">
                                {formatDate(activeStream.scheduled_time)} at{" "}
                                {formatTime(activeStream.scheduled_time)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Clock className="h-12 w-12 mb-4 text-white/80" />
                            <p className="text-lg font-medium">Stream starts</p>
                            <p className="text-2xl font-bold">
                              {formatDate(activeStream.scheduled_time)} at{" "}
                              {formatTime(activeStream.scheduled_time)}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stream Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-white">{activeStream.title}</h2>
                        <p className="text-white/60 mt-1">
                          {activeStream.description}
                        </p>
                      </div>
                      {activeStream.is_live && (
                        <span className="bg-neon text-black text-xs font-bold uppercase px-2 py-1">
                          <Radio className="h-3 w-3 mr-1 inline" />
                          LIVE
                        </span>
                      )}
                    </div>

                    {activeStream.game && (
                      <Link
                        href={`/games/${activeStream.game.id}`}
                        className="inline-flex items-center gap-1 border border-white/20 text-white px-4 py-2 text-sm hover:border-neon hover:text-neon transition-colors mt-2"
                      >
                        View Game Details
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#121212] border border-white/10 py-20 text-center">
                  <Video className="h-16 w-16 mx-auto mb-4 text-white/20" />
                  <h2 className="text-xl font-bold text-white mb-2">No Streams Available</h2>
                  <p className="text-white/40">
                    Check back later for upcoming live streams
                  </p>
                </div>
              )}

              {/* Sponsor Banner */}
              <div className="mt-6">
                <SponsorBanner sponsors={sponsors} />
              </div>
            </div>

            {/* Stream List */}
            <div className="space-y-6">
              {/* Live Now */}
              {liveStreams.length > 0 && (
                <div className="bg-[#121212] border border-white/10">
                  <div className="px-6 py-4 border-b border-white/10">
                    <h3 className="font-display text-lg text-neon flex items-center gap-2">
                      <Radio className="h-5 w-5" />
                      Live Now
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {liveStreams.map((stream) => (
                      <button
                        key={stream.id}
                        onClick={() => setSelectedStream(stream)}
                        className={`w-full text-left p-3 transition-colors ${
                          selectedStream?.id === stream.id
                            ? "border border-neon bg-neon/5"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {stream.thumbnail_url ? (
                              <img
                                src={stream.thumbnail_url}
                                alt=""
                                className="w-20 h-12 object-cover"
                              />
                            ) : (
                              <div className="w-20 h-12 bg-white/10 flex items-center justify-center">
                                <Play className="h-6 w-6 text-white/40" />
                              </div>
                            )}
                            <span className="absolute -top-1 -right-1 bg-neon text-black text-[10px] font-bold px-1">
                              LIVE
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{stream.title}</p>
                            <p className="text-xs text-white/40">
                              {stream.game?.home_team?.abbreviation} vs{" "}
                              {stream.game?.away_team?.abbreviation}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Streams */}
              <div className="bg-[#121212] border border-white/10">
                <div className="px-6 py-4 border-b border-white/10">
                  <h3 className="font-display text-lg text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-white/40" />
                    Upcoming Streams
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {upcomingStreams.length > 0 ? (
                    upcomingStreams.map((stream) => (
                      <button
                        key={stream.id}
                        onClick={() => setSelectedStream(stream)}
                        className={`w-full text-left p-3 transition-colors ${
                          selectedStream?.id === stream.id
                            ? "border border-neon bg-neon/5"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {stream.thumbnail_url ? (
                            <img
                              src={stream.thumbnail_url}
                              alt=""
                              className="w-20 h-12 object-cover"
                            />
                          ) : (
                            <div className="w-20 h-12 bg-white/10 flex items-center justify-center">
                              <Play className="h-6 w-6 text-white/40" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{stream.title}</p>
                            <p className="text-xs text-white/40">
                              {formatDate(stream.scheduled_time)} at{" "}
                              {formatTime(stream.scheduled_time)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-white/40 text-center py-4">
                      No upcoming streams scheduled
                    </p>
                  )}
                </div>
              </div>

              {/* Schedule Link */}
              <Link
                href="/schedule"
                className="flex items-center justify-center gap-2 border border-white/20 text-white py-3 text-sm font-bold uppercase tracking-wider hover:border-neon hover:text-neon transition-colors"
              >
                <Calendar className="h-4 w-4" />
                View Full Schedule
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
