"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Footer } from "@/components/footer"
import { ImageUpload } from "@/components/image-upload"
import {
  Users,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Check,
  UserPlus,
  User,
} from "lucide-react"

const MIN_PLAYERS = 5
const MAX_PLAYERS = 15

export default function RosterEntryPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token

  const [registration, setRegistration] = useState(null)
  const [players, setPlayers] = useState([])
  const [newPlayerName, setNewPlayerName] = useState("")
  const [newPlayerPhotoUrl, setNewPlayerPhotoUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [addingPlayer, setAddingPlayer] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [tokenError, setTokenError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/team-roster/${token}`)
        if (!response.ok) {
          const data = await response.json()
          setTokenError(data.error || "Invalid or expired link")
          setLoading(false)
          return
        }
        const data = await response.json()
        setRegistration(data.registration)
        setPlayers(data.players || [])
      } catch (err) {
        setTokenError("Failed to load roster data")
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchData()
    }
  }, [token])

  const handleAddPlayer = async () => {
    const trimmedName = newPlayerName.trim()
    if (!trimmedName) {
      setError("Please enter a player name")
      return
    }
    if (trimmedName.length < 2) {
      setError("Player name must be at least 2 characters")
      return
    }
    if (players.length >= MAX_PLAYERS) {
      setError(`Maximum ${MAX_PLAYERS} players allowed`)
      return
    }

    setAddingPlayer(true)
    setError(null)

    try {
      const response = await fetch(`/api/team-roster/${token}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_name: trimmedName, photo_url: newPlayerPhotoUrl || null }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to add player")
      }

      setPlayers((prev) => [...prev, data])
      setNewPlayerName("")
      setNewPlayerPhotoUrl("")
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingPlayer(false)
    }
  }

  const handleRemovePlayer = async (playerId) => {
    try {
      const response = await fetch(`/api/team-roster/${token}/players`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_id: playerId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to remove player")
      }

      setPlayers((prev) => prev.filter((p) => p.id !== playerId))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSubmitRoster = async () => {
    if (players.length < MIN_PLAYERS) {
      setError(`You need at least ${MIN_PLAYERS} players to submit`)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/team-roster/${token}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit roster")
      }

      router.push(`/team-roster/${token}/complete`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !addingPlayer) {
      handleAddPlayer()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#080808]">
        <main className="flex-1 container py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-neon mx-auto mb-4" />
            <p className="text-white/40">Loading roster...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex flex-col bg-[#080808]">
        <main className="flex-1 container py-12">
          <div className="bg-[#121212] border border-white/10 max-w-lg mx-auto p-8 text-center">
            <div className="w-16 h-16 bg-neon/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-neon" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
            <p className="text-white/40 mb-6">{tokenError}</p>
            <button
              onClick={() => router.push("/register/team")}
              className="bg-neon text-black px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-neon/90 transition-colors"
            >
              Register a New Team
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const canSubmit = players.length >= MIN_PLAYERS
  const progressPercent = Math.min((players.length / MIN_PLAYERS) * 100, 100)

  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <main className="flex-1">
        {/* Header */}
        <section className="py-8">
          <div className="container">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 flex items-center justify-center font-bold"
                style={{
                  backgroundColor: registration?.primary_color || "#1E3A8A",
                  color: registration?.secondary_color || "#FFFFFF",
                }}
              >
                {registration?.team_name?.substring(0, 2).toUpperCase() || "TM"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {registration?.team_name || "Team"} Roster
                </h1>
                <p className="text-sm text-white/40">
                  Add your players to complete registration
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container pb-16">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Progress */}
            <div className="bg-[#121212] border border-white/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">
                  {players.length} of {MIN_PLAYERS}-{MAX_PLAYERS} players
                </span>
                {canSubmit ? (
                  <span className="text-sm text-neon flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    Ready to submit
                  </span>
                ) : (
                  <span className="text-sm text-white/40">
                    Need {MIN_PLAYERS - players.length} more
                  </span>
                )}
              </div>
              <div className="h-2 bg-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    canSubmit ? "bg-neon" : "bg-neon/60"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {error && (
              <div className="bg-neon/10 text-neon p-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            {/* Add Player Form */}
            <div className="bg-[#121212] border border-white/10 p-6">
              <h2 className="font-bold text-white flex items-center gap-2 mb-1">
                <UserPlus className="h-5 w-5" />
                Add Player
              </h2>
              <p className="text-sm text-white/40 mb-4">
                Enter player names one at a time
              </p>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    placeholder="Player name"
                    value={newPlayerName}
                    onChange={(e) => {
                      setNewPlayerName(e.target.value)
                      setError(null)
                    }}
                    onKeyPress={handleKeyPress}
                    disabled={players.length >= MAX_PLAYERS || addingPlayer}
                    className="flex-1 px-4 py-2 bg-[#121212] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-neon transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={handleAddPlayer}
                    disabled={players.length >= MAX_PLAYERS || addingPlayer || !newPlayerName.trim()}
                    className="bg-neon text-black px-4 py-2 hover:bg-neon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingPlayer ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div>
                  <p className="text-sm text-white/40 mb-2">Player Photo (optional)</p>
                  <ImageUpload
                    folder="players"
                    currentUrl={newPlayerPhotoUrl || null}
                    onUpload={(url) => setNewPlayerPhotoUrl(url)}
                  />
                </div>
              </div>
            </div>

            {/* Player List */}
            <div className="bg-[#121212] border border-white/10 p-6">
              <h2 className="font-bold text-white flex items-center gap-2 mb-4">
                <Users className="h-5 w-5" />
                Roster ({players.length})
              </h2>
              {players.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No players added yet</p>
                  <p className="text-sm">Start adding your team members above</p>
                </div>
              ) : (
                <ul className="divide-y divide-white/10">
                  {players.map((player, index) => (
                    <li
                      key={player.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        {player.photo_url ? (
                          <img
                            src={player.photo_url}
                            alt={player.player_name}
                            className="w-8 h-8 object-cover"
                          />
                        ) : (
                          <span className="w-8 h-8 bg-white/10 flex items-center justify-center text-sm">
                            <User className="h-4 w-4 text-white/40" />
                          </span>
                        )}
                        <span className="font-medium text-white">{player.player_name}</span>
                      </div>
                      <button
                        onClick={() => handleRemovePlayer(player.id)}
                        className="text-white/40 hover:text-neon transition-colors p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Submit Button */}
            <div className="bg-[#121212] border border-white/10 p-4">
              <button
                onClick={handleSubmitRoster}
                disabled={!canSubmit || submitting}
                className="w-full bg-neon text-black py-3 font-bold uppercase tracking-wider text-sm hover:bg-neon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Submit Roster ({players.length} players)
                  </>
                )}
              </button>
              {!canSubmit && (
                <p className="text-sm text-center text-white/40 mt-2">
                  Add at least {MIN_PLAYERS - players.length} more player{MIN_PLAYERS - players.length !== 1 ? "s" : ""} to submit
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
