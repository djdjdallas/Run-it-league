"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Footer } from "@/components/footer"
import { SponsorBanner } from "@/components/sponsor-banner"
import {
  UserPlus,
  Check,
  AlertCircle,
  Loader2,
  CreditCard,
  Shield,
  Calendar,
} from "lucide-react"

const positions = [
  { value: "PG", label: "Point Guard (PG)" },
  { value: "SG", label: "Shooting Guard (SG)" },
  { value: "SF", label: "Small Forward (SF)" },
  { value: "PF", label: "Power Forward (PF)" },
  { value: "C", label: "Center (C)" },
  { value: "any", label: "Any Position" },
]

const experienceLevels = [
  { value: "beginner", label: "Beginner - New to organized play" },
  { value: "intermediate", label: "Intermediate - Some league experience" },
  { value: "advanced", label: "Advanced - Competitive experience" },
]

const registrationFee = 75.00

export default function RegisterClient({ teams, sponsors }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    position: "",
    experience_level: "",
    team_preference: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    medical_conditions: "",
    waiver_signed: false,
  })

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validateStep1 = () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError("Please fill in all required fields")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.position || !formData.experience_level) {
      setError("Please select your position and experience level")
      return false
    }
    if (!formData.emergency_contact_name || !formData.emergency_contact_phone) {
      setError("Emergency contact information is required")
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
      setError("You must agree to the waiver to continue")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // In production, this would:
      // 1. Create registration record in Supabase
      // 2. Create Stripe checkout session
      // 3. Redirect to payment
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSuccess(true)
    } catch (err) {
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container py-12">
          <Card className="max-w-lg mx-auto">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Registration Complete!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for registering. You will receive a confirmation email
                shortly with next steps.
              </p>
              <div className="space-y-3">
                <Link href="/">
                  <Button className="w-full">Return to Home</Button>
                </Link>
                <Link href="/schedule">
                  <Button variant="outline" className="w-full">
                    View Schedule
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-500/10 via-background to-background py-8">
          <div className="container">
            <div className="flex items-center gap-3 mb-4">
              <UserPlus className="h-8 w-8 text-green-500" />
              <h1 className="text-3xl font-bold tracking-tight">
                Player Registration
              </h1>
            </div>
            <p className="text-muted-foreground">
              Join the Run It League for the upcoming season
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
                    {step === 1 && "Personal Information"}
                    {step === 2 && "Playing Preferences"}
                    {step === 3 && "Review & Payment"}
                  </CardTitle>
                  <CardDescription>
                    {step === 1 && "Tell us about yourself"}
                    {step === 2 && "Help us find the right team for you"}
                    {step === 3 && "Confirm your registration"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      {error}
                    </div>
                  )}

                  {/* Step 1: Personal Info */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">First Name *</Label>
                          <Input
                            id="first_name"
                            value={formData.first_name}
                            onChange={(e) =>
                              updateField("first_name", e.target.value)
                            }
                            placeholder="John"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Last Name *</Label>
                          <Input
                            id="last_name"
                            value={formData.last_name}
                            onChange={(e) =>
                              updateField("last_name", e.target.value)
                            }
                            placeholder="Smith"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          placeholder="john@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          placeholder="(555) 123-4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          id="dob"
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) =>
                            updateField("date_of_birth", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Playing Preferences */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="position">Preferred Position *</Label>
                        <select
                          id="position"
                          value={formData.position}
                          onChange={(e) =>
                            updateField("position", e.target.value)
                          }
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="">Select a position</option>
                          {positions.map((pos) => (
                            <option key={pos.value} value={pos.value}>
                              {pos.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="experience">Experience Level *</Label>
                        <select
                          id="experience"
                          value={formData.experience_level}
                          onChange={(e) =>
                            updateField("experience_level", e.target.value)
                          }
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="">Select experience level</option>
                          {experienceLevels.map((level) => (
                            <option key={level.value} value={level.value}>
                              {level.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="team_pref">
                          Team Preference (Optional)
                        </Label>
                        <select
                          id="team_pref"
                          value={formData.team_preference}
                          onChange={(e) =>
                            updateField("team_preference", e.target.value)
                          }
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="">No preference</option>
                          {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="border-t pt-4 mt-6">
                        <h4 className="font-medium mb-4">Emergency Contact *</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="emergency_name">Contact Name</Label>
                            <Input
                              id="emergency_name"
                              value={formData.emergency_contact_name}
                              onChange={(e) =>
                                updateField(
                                  "emergency_contact_name",
                                  e.target.value
                                )
                              }
                              placeholder="Jane Smith"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emergency_phone">
                              Contact Phone
                            </Label>
                            <Input
                              id="emergency_phone"
                              type="tel"
                              value={formData.emergency_contact_phone}
                              onChange={(e) =>
                                updateField(
                                  "emergency_contact_phone",
                                  e.target.value
                                )
                              }
                              placeholder="(555) 987-6543"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medical">
                          Medical Conditions (Optional)
                        </Label>
                        <Textarea
                          id="medical"
                          value={formData.medical_conditions}
                          onChange={(e) =>
                            updateField("medical_conditions", e.target.value)
                          }
                          placeholder="List any medical conditions or allergies we should know about..."
                          rows={3}
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
                          <span className="text-muted-foreground">Name:</span>
                          <span>
                            {formData.first_name} {formData.last_name}
                          </span>
                          <span className="text-muted-foreground">Email:</span>
                          <span>{formData.email}</span>
                          <span className="text-muted-foreground">
                            Position:
                          </span>
                          <span>{formData.position}</span>
                          <span className="text-muted-foreground">
                            Experience:
                          </span>
                          <span className="capitalize">
                            {formData.experience_level}
                          </span>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-medium">Season Registration</span>
                          <span className="text-xl font-bold">
                            ${registrationFee.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Includes league fees, referee fees, and gym rental for
                          the entire season.
                        </p>
                      </div>

                      <div className="border-t pt-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.waiver_signed}
                            onChange={(e) =>
                              updateField("waiver_signed", e.target.checked)
                            }
                            className="mt-1"
                          />
                          <span className="text-sm">
                            I have read and agree to the{" "}
                            <a
                              href="#"
                              className="text-primary hover:underline"
                            >
                              liability waiver
                            </a>{" "}
                            and{" "}
                            <a
                              href="#"
                              className="text-primary hover:underline"
                            >
                              league rules
                            </a>
                            . I understand that playing basketball involves risk
                            of injury.
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
                            Pay & Register
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
                      <p className="font-medium">${registrationFee} Fee</p>
                      <p className="text-sm text-muted-foreground">
                        Covers entire season
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
                  <CardTitle className="text-lg">What&apos;s Included</CardTitle>
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
                      Stats tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      Team jersey
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <SponsorBanner sponsors={sponsors} variant="compact" showTitle={false} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
