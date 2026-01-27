"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-red-500/10 via-background to-background py-8">
          <div className="container">
            <div className="flex items-center gap-3 mb-4">
              <Video className="h-8 w-8 text-red-500" />
              <h1 className="text-3xl font-bold tracking-tight">Live Games</h1>
              {liveStreams.length > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  <Radio className="h-3 w-3 mr-1" />
                  LIVE NOW
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Watch live games and catch up on replays
            </p>
          </div>
        </section>

        <div className="container py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Video Player */}
            <div className="lg:col-span-2">
              {activeStream ? (
                <Card>
                  <CardContent className="p-0">
                    {/* Video Embed */}
                    <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
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
                          <h2 className="text-xl font-bold">{activeStream.title}</h2>
                          <p className="text-muted-foreground mt-1">
                            {activeStream.description}
                          </p>
                        </div>
                        {activeStream.is_live && (
                          <Badge variant="destructive">
                            <Radio className="h-3 w-3 mr-1" />
                            LIVE
                          </Badge>
                        )}
                      </div>

                      {activeStream.game && (
                        <Link href={`/games/${activeStream.game.id}`}>
                          <Button variant="outline" className="mt-2">
                            View Game Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-20 text-center">
                    <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-xl font-semibold mb-2">No Streams Available</h2>
                    <p className="text-muted-foreground">
                      Check back later for upcoming live streams
                    </p>
                  </CardContent>
                </Card>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-500">
                      <Radio className="h-5 w-5 mr-2" />
                      Live Now
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {liveStreams.map((stream) => (
                      <button
                        key={stream.id}
                        onClick={() => setSelectedStream(stream)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedStream?.id === stream.id
                            ? "bg-primary/10 border border-primary"
                            : "bg-muted/50 hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {stream.thumbnail_url ? (
                              <img
                                src={stream.thumbnail_url}
                                alt=""
                                className="w-20 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-20 h-12 bg-muted rounded flex items-center justify-center">
                                <Play className="h-6 w-6" />
                              </div>
                            )}
                            <Badge
                              variant="destructive"
                              className="absolute -top-1 -right-1 text-xs px-1 py-0"
                            >
                              LIVE
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{stream.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {stream.game?.home_team?.abbreviation} vs{" "}
                              {stream.game?.away_team?.abbreviation}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Streams */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Streams
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingStreams.length > 0 ? (
                    upcomingStreams.map((stream) => (
                      <button
                        key={stream.id}
                        onClick={() => setSelectedStream(stream)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedStream?.id === stream.id
                            ? "bg-primary/10 border border-primary"
                            : "bg-muted/50 hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {stream.thumbnail_url ? (
                            <img
                              src={stream.thumbnail_url}
                              alt=""
                              className="w-20 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-20 h-12 bg-muted rounded flex items-center justify-center">
                              <Play className="h-6 w-6" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{stream.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(stream.scheduled_time)} at{" "}
                              {formatTime(stream.scheduled_time)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No upcoming streams scheduled
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Schedule Link */}
              <Link href="/schedule">
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Full Schedule
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
