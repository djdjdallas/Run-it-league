"use client"

import { useState } from "react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { SponsorBanner } from "@/components/sponsor-banner"
import { ImageUpload } from "@/components/image-upload"
import {
  Users,
  Check,
  AlertCircle,
  Loader2,
  CreditCard,
  Shield,
  Calendar,
  Palette,
} from "lucide-react"

const teamRegistrationFee = 450.00

export default function TeamRegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    team_name: "",
    primary_color: "#1E3A8A",
    secondary_color: "#F59E0B",
    captain_name: "",
    captain_email: "",
    captain_phone: "",
    logo_url: "",
    waiver_signed: false,
  })

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validateStep1 = () => {
    if (!formData.team_name) {
      setError("Please enter your team name")
      return false
    }
    if (formData.team_name.length < 3) {
      setError("Team name must be at least 3 characters")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.captain_name || !formData.captain_email) {
      setError("Please fill in all required fields")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.captain_email)) {
      setError("Please enter a valid email address")
      return false
    }
    return true
  }

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleSubmit = async () => {
    if (!formData.waiver_signed) {
      setError("You must agree to the terms to continue")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const regResponse = await fetch("/api/team-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_name: formData.team_name,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          captain_name: formData.captain_name,
          captain_email: formData.captain_email,
          captain_phone: formData.captain_phone,
          logo_url: formData.logo_url || null,
        }),
      })

      const regData = await regResponse.json()
      if (!regResponse.ok) {
        throw new Error(regData.error || "Failed to create registration")
      }

      const checkoutResponse = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "team_registration",
          team_registration_id: regData.id,
          email: formData.captain_email,
        }),
      })

      const checkoutData = await checkoutResponse.json()
      if (!checkoutResponse.ok) {
        throw new Error(checkoutData.error || "Failed to create checkout")
      }

      if (checkoutData.url) {
        window.location.href = checkoutData.url
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <main className="flex-1">
        {/* Header */}
        <section className="py-12">
          <div className="container">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-neon" />
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Team Registration
              </h1>
            </div>
            <p className="text-white/40">
              Register your team for the Run It League - ${teamRegistrationFee} per team
            </p>
          </div>
        </section>

        <div className="container pb-16">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Registration Form */}
            <div className="lg:col-span-2">
              <div className="bg-[#121212] border border-white/10 p-6 md:p-8">
                {/* Progress Steps */}
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                      <div
                        className={`w-8 h-8 flex items-center justify-center text-sm font-medium ${
                          step >= s
                            ? "bg-neon text-black"
                            : "bg-white/10 text-white/40"
                        }`}
                      >
                        {step > s ? <Check className="h-4 w-4" /> : s}
                      </div>
                      {s < 3 && (
                        <div
                          className={`w-12 h-0.5 mx-2 ${
                            step > s ? "bg-neon" : "bg-white/10"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <h2 className="text-xl font-bold text-white mb-1">
                  {step === 1 && "Team Information"}
                  {step === 2 && "Captain Information"}
                  {step === 3 && "Review & Payment"}
                </h2>
                <p className="text-white/40 text-sm mb-6">
                  {step === 1 && "Tell us about your team"}
                  {step === 2 && "Enter the team captain's details"}
                  {step === 3 && "Confirm and pay to complete registration"}
                </p>

                {error && (
                  <div className="bg-neon/10 text-neon p-4 mb-6 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                  </div>
                )}

                {/* Step 1: Team Info */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="team_name" className="text-sm font-medium text-white">
                        Team Name *
                      </label>
                      <input
                        id="team_name"
                        value={formData.team_name}
                        onChange={(e) => updateField("team_name", e.target.value)}
                        placeholder="e.g., Thunder Hawks"
                        className="w-full px-4 py-2 bg-[#121212] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-neon transition-colors"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <Palette className="h-4 w-4" />
                        Team Colors
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="primary_color" className="text-sm text-white/40">
                            Primary Color
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              id="primary_color"
                              value={formData.primary_color}
                              onChange={(e) => updateField("primary_color", e.target.value)}
                              className="w-12 h-10 border border-white/10 cursor-pointer bg-transparent"
                            />
                            <input
                              value={formData.primary_color}
                              onChange={(e) => updateField("primary_color", e.target.value)}
                              className="flex-1 px-4 py-2 bg-[#121212] border border-white/10 text-white font-mono focus:outline-none focus:border-neon transition-colors"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="secondary_color" className="text-sm text-white/40">
                            Secondary Color
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              id="secondary_color"
                              value={formData.secondary_color}
                              onChange={(e) => updateField("secondary_color", e.target.value)}
                              className="w-12 h-10 border border-white/10 cursor-pointer bg-transparent"
                            />
                            <input
                              value={formData.secondary_color}
                              onChange={(e) => updateField("secondary_color", e.target.value)}
                              className="flex-1 px-4 py-2 bg-[#121212] border border-white/10 text-white font-mono focus:outline-none focus:border-neon transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Color Preview */}
                      <div className="p-4 border border-white/10">
                        <p className="text-sm text-white/40 mb-2">Preview:</p>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-16 h-16 flex items-center justify-center font-bold text-lg"
                            style={{
                              backgroundColor: formData.primary_color,
                              color: formData.secondary_color,
                            }}
                          >
                            {formData.team_name ? formData.team_name.substring(0, 3).toUpperCase() : "ABC"}
                          </div>
                          <div>
                            <p className="font-medium text-white">{formData.team_name || "Your Team"}</p>
                            <p className="text-sm text-white/40">Team badge preview</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Team Logo (optional)</label>
                      <ImageUpload
                        folder="teams"
                        currentUrl={formData.logo_url || null}
                        onUpload={(url) => updateField("logo_url", url)}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Captain Info */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="captain_name" className="text-sm font-medium text-white">
                        Captain Name *
                      </label>
                      <input
                        id="captain_name"
                        value={formData.captain_name}
                        onChange={(e) => updateField("captain_name", e.target.value)}
                        placeholder="John Smith"
                        className="w-full px-4 py-2 bg-[#121212] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-neon transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="captain_email" className="text-sm font-medium text-white">
                        Captain Email *
                      </label>
                      <input
                        id="captain_email"
                        type="email"
                        value={formData.captain_email}
                        onChange={(e) => updateField("captain_email", e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2 bg-[#121212] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-neon transition-colors"
                      />
                      <p className="text-xs text-white/30">
                        The roster entry link will be sent to this email
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="captain_phone" className="text-sm font-medium text-white">
                        Captain Phone
                      </label>
                      <input
                        id="captain_phone"
                        type="tel"
                        value={formData.captain_phone}
                        onChange={(e) => updateField("captain_phone", e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-2 bg-[#121212] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-neon transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Review & Payment */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="bg-white/5 p-4 space-y-3">
                      <h4 className="font-medium text-white">Registration Summary</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-white/40">Team Name:</span>
                        <span className="font-medium text-white">{formData.team_name}</span>
                        <span className="text-white/40">Captain:</span>
                        <span className="text-white/60">{formData.captain_name}</span>
                        <span className="text-white/40">Email:</span>
                        <span className="text-white/60">{formData.captain_email}</span>
                        {formData.captain_phone && (
                          <>
                            <span className="text-white/40">Phone:</span>
                            <span className="text-white/60">{formData.captain_phone}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-white/40 text-sm">Team Colors:</span>
                        <div
                          className="w-6 h-6 border border-white/10"
                          style={{ backgroundColor: formData.primary_color }}
                        />
                        <div
                          className="w-6 h-6 border border-white/10"
                          style={{ backgroundColor: formData.secondary_color }}
                        />
                      </div>
                      {formData.logo_url && (
                        <div className="pt-2">
                          <span className="text-white/40 text-sm">Team Logo:</span>
                          <img
                            src={formData.logo_url}
                            alt="Team logo"
                            className="w-20 h-20 object-cover border border-white/10 mt-1"
                          />
                        </div>
                      )}
                    </div>

                    <div className="border border-white/10 p-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-medium text-white">Team Registration Fee</span>
                        <span className="text-xl font-bold text-white">
                          ${teamRegistrationFee.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-white/40">
                        Covers team entry for the entire season. After payment, you&apos;ll receive a link to enter your roster (5-15 players).
                      </p>
                    </div>

                    <div className="bg-neon/5 border border-neon/20 p-4">
                      <h4 className="font-medium text-white mb-2">Next Steps After Payment</h4>
                      <ol className="text-sm text-white/60 space-y-1 list-decimal list-inside">
                        <li>You&apos;ll be redirected to a success page with a roster entry link</li>
                        <li>Use that link to add your players (5-15 names required)</li>
                        <li>Once submitted, your team will be officially registered</li>
                      </ol>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.waiver_signed}
                          onChange={(e) => updateField("waiver_signed", e.target.checked)}
                          className="mt-1 accent-[#C92B2A]"
                        />
                        <span className="text-sm text-white/60">
                          I agree to the{" "}
                          <a href="#" className="text-neon hover:underline">
                            league rules
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-neon hover:underline">
                            terms of service
                          </a>
                          . I understand that I am responsible for my team&apos;s conduct.
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <button
                      onClick={() => setStep((s) => s - 1)}
                      className="border border-white/20 text-white px-6 py-3 text-sm font-bold uppercase tracking-wider hover:border-neon hover:text-neon transition-colors"
                    >
                      Back
                    </button>
                  ) : (
                    <div />
                  )}
                  {step < 3 ? (
                    <button
                      onClick={handleNextStep}
                      className="bg-neon text-black px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-neon/90 transition-colors"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={loading || !formData.waiver_signed}
                      className="bg-neon text-black px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-neon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          Pay ${teamRegistrationFee}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-[#121212] border border-white/10 p-6">
                <h3 className="font-bold text-white mb-4">Registration Info</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-neon mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Spring 2026 Season</p>
                      <p className="text-sm text-white/40">March - June 2026</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-neon mt-0.5" />
                    <div>
                      <p className="font-medium text-white">${teamRegistrationFee} per Team</p>
                      <p className="text-sm text-white/40">One-time registration fee</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-neon mt-0.5" />
                    <div>
                      <p className="font-medium text-white">5-15 Players</p>
                      <p className="text-sm text-white/40">Roster size requirements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-neon mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Secure Payment</p>
                      <p className="text-sm text-white/40">Processed via Stripe</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#121212] border border-white/10 p-6">
                <h3 className="font-bold text-white mb-4">What&apos;s Included</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-white/60">
                    <Check className="h-4 w-4 text-neon" />
                    10+ regular season games
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <Check className="h-4 w-4 text-neon" />
                    Playoff eligibility
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <Check className="h-4 w-4 text-neon" />
                    Professional referees
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <Check className="h-4 w-4 text-neon" />
                    Stats tracking for all players
                  </li>
                  <li className="flex items-center gap-2 text-white/60">
                    <Check className="h-4 w-4 text-neon" />
                    Live streaming of games
                  </li>
                </ul>
                <p className="text-xs text-white/30 mt-3 italic">*Jerseys not included</p>
              </div>

              <SponsorBanner variant="compact" showTitle={false} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
