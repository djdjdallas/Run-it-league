"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Footer } from "@/components/footer"
import { SponsorBanner } from "@/components/sponsor-banner"
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

const teamRegistrationFee = 500.00

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
      // 1. Create team registration record
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
        }),
      })

      const regData = await regResponse.json()
      if (!regResponse.ok) {
        throw new Error(regData.error || "Failed to create registration")
      }

      // 2. Create checkout session
      const checkoutResponse = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "team_registration",
          team_registration_id: regData.id,
          amount: teamRegistrationFee,
          email: formData.captain_email,
          description: `Team Registration: ${formData.team_name}`,
        }),
      })

      const checkoutData = await checkoutResponse.json()
      if (!checkoutResponse.ok) {
        throw new Error(checkoutData.error || "Failed to create checkout")
      }

      // 3. Redirect to payment (or success in demo mode)
      if (checkoutData.url) {
        // For demo mode, include the registration ID
        const redirectUrl = checkoutData.url.includes("?")
          ? `${checkoutData.url}&registration_id=${regData.id}`
          : `${checkoutData.url}?registration_id=${regData.id}`
        window.location.href = redirectUrl
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-500/10 via-background to-background py-8">
          <div className="container">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold tracking-tight">
                Team Registration
              </h1>
            </div>
            <p className="text-muted-foreground">
              Register your team for the Run It League - ${teamRegistrationFee} per team
            </p>
          </div>
        </section>

        <div className="container py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Registration Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    {/* Progress Steps */}
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              step >= s
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {step > s ? <Check className="h-4 w-4" /> : s}
                          </div>
                          {s < 3 && (
                            <div
                              className={`w-12 h-1 mx-2 ${
                                step > s ? "bg-primary" : "bg-muted"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <CardTitle>
                    {step === 1 && "Team Information"}
                    {step === 2 && "Captain Information"}
                    {step === 3 && "Review & Payment"}
                  </CardTitle>
                  <CardDescription>
                    {step === 1 && "Tell us about your team"}
                    {step === 2 && "Enter the team captain's details"}
                    {step === 3 && "Confirm and pay to complete registration"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      {error}
                    </div>
                  )}

                  {/* Step 1: Team Info */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="team_name">Team Name *</Label>
                        <Input
                          id="team_name"
                          value={formData.team_name}
                          onChange={(e) => updateField("team_name", e.target.value)}
                          placeholder="e.g., Thunder Hawks"
                        />
                      </div>

                      <div className="space-y-4">
                        <Label className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Team Colors
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="primary_color" className="text-sm text-muted-foreground">
                              Primary Color
                            </Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                id="primary_color"
                                value={formData.primary_color}
                                onChange={(e) => updateField("primary_color", e.target.value)}
                                className="w-12 h-10 rounded border cursor-pointer"
                              />
                              <Input
                                value={formData.primary_color}
                                onChange={(e) => updateField("primary_color", e.target.value)}
                                className="font-mono"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="secondary_color" className="text-sm text-muted-foreground">
                              Secondary Color
                            </Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                id="secondary_color"
                                value={formData.secondary_color}
                                onChange={(e) => updateField("secondary_color", e.target.value)}
                                className="w-12 h-10 rounded border cursor-pointer"
                              />
                              <Input
                                value={formData.secondary_color}
                                onChange={(e) => updateField("secondary_color", e.target.value)}
                                className="font-mono"
                              />
                            </div>
                          </div>
                        </div>
                        {/* Color Preview */}
                        <div className="p-4 rounded-lg border">
                          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-16 h-16 rounded-lg flex items-center justify-center font-bold text-lg"
                              style={{
                                backgroundColor: formData.primary_color,
                                color: formData.secondary_color,
                              }}
                            >
                              {formData.team_name ? formData.team_name.substring(0, 3).toUpperCase() : "ABC"}
                            </div>
                            <div>
                              <p className="font-medium">{formData.team_name || "Your Team"}</p>
                              <p className="text-sm text-muted-foreground">Team badge preview</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Captain Info */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="captain_name">Captain Name *</Label>
                        <Input
                          id="captain_name"
                          value={formData.captain_name}
                          onChange={(e) => updateField("captain_name", e.target.value)}
                          placeholder="John Smith"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="captain_email">Captain Email *</Label>
                        <Input
                          id="captain_email"
                          type="email"
                          value={formData.captain_email}
                          onChange={(e) => updateField("captain_email", e.target.value)}
                          placeholder="john@example.com"
                        />
                        <p className="text-xs text-muted-foreground">
                          The roster entry link will be sent to this email
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="captain_phone">Captain Phone</Label>
                        <Input
                          id="captain_phone"
                          type="tel"
                          value={formData.captain_phone}
                          onChange={(e) => updateField("captain_phone", e.target.value)}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review & Payment */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <h4 className="font-medium">Registration Summary</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-muted-foreground">Team Name:</span>
                          <span className="font-medium">{formData.team_name}</span>
                          <span className="text-muted-foreground">Captain:</span>
                          <span>{formData.captain_name}</span>
                          <span className="text-muted-foreground">Email:</span>
                          <span>{formData.captain_email}</span>
                          {formData.captain_phone && (
                            <>
                              <span className="text-muted-foreground">Phone:</span>
                              <span>{formData.captain_phone}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <span className="text-muted-foreground text-sm">Team Colors:</span>
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: formData.primary_color }}
                          />
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: formData.secondary_color }}
                          />
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-medium">Team Registration Fee</span>
                          <span className="text-xl font-bold">
                            ${teamRegistrationFee.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Covers team entry for the entire season. After payment, you'll receive a link to enter your roster (5-15 players).
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Next Steps After Payment</h4>
                        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                          <li>You'll be redirected to a success page with a roster entry link</li>
                          <li>Use that link to add your players (5-15 names required)</li>
                          <li>Once submitted, your team will be officially registered</li>
                        </ol>
                      </div>

                      <div className="border-t pt-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.waiver_signed}
                            onChange={(e) => updateField("waiver_signed", e.target.checked)}
                            className="mt-1"
                          />
                          <span className="text-sm">
                            I agree to the{" "}
                            <a href="#" className="text-primary hover:underline">
                              league rules
                            </a>{" "}
                            and{" "}
                            <a href="#" className="text-primary hover:underline">
                              terms of service
                            </a>
                            . I understand that I am responsible for my team's conduct.
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8">
                    {step > 1 ? (
                      <Button
                        variant="outline"
                        onClick={() => setStep((s) => s - 1)}
                      >
                        Back
                      </Button>
                    ) : (
                      <div />
                    )}
                    {step < 3 ? (
                      <Button onClick={handleNextStep}>Continue</Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={loading || !formData.waiver_signed}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay ${teamRegistrationFee}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Registration Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Spring 2025 Season</p>
                      <p className="text-sm text-muted-foreground">
                        March - June 2025
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">${teamRegistrationFee} per Team</p>
                      <p className="text-sm text-muted-foreground">
                        One-time registration fee
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">5-15 Players</p>
                      <p className="text-sm text-muted-foreground">
                        Roster size requirements
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Secure Payment</p>
                      <p className="text-sm text-muted-foreground">
                        Processed via Stripe
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      10+ regular season games
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Playoff eligibility
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Professional referees
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Stats tracking for all players
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Live streaming of games
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <SponsorBanner variant="compact" showTitle={false} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
