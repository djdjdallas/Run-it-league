"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  UserPlus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Eye,
  Users,
  Send,
  Copy,
  Check,
  DollarSign,
  Loader2,
  Link2,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

const playerStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  waitlist: "bg-blue-100 text-blue-800",
}

const teamStatusColors = {
  pending_payment: "bg-yellow-100 text-yellow-800",
  invoice_sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  roster_complete: "bg-emerald-100 text-emerald-800",
  payment_expired: "bg-red-100 text-red-800",
}

const teamStatusLabels = {
  pending_payment: "Pending",
  invoice_sent: "Invoice Sent",
  paid: "Paid",
  roster_complete: "Complete",
  payment_expired: "Expired",
}

export default function RegistrationsClient({
  initialRegistrations,
  initialTeamRegistrations,
}) {
  const router = useRouter()
  const [tab, setTab] = useState("teams")
  const [registrations, setRegistrations] = useState(initialRegistrations)
  const [teamRegistrations, setTeamRegistrations] = useState(
    initialTeamRegistrations
  )
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [invoiceLoading, setInvoiceLoading] = useState(null)
  const [paymentUrl, setPaymentUrl] = useState(null)
  const [copied, setCopied] = useState(false)
  const [copiedRosterId, setCopiedRosterId] = useState(null)

  // ---- Team registrations filtering ----
  const filteredTeamRegistrations = teamRegistrations.filter((reg) => {
    const matchesSearch =
      search === "" ||
      reg.team_name.toLowerCase().includes(search.toLowerCase()) ||
      reg.captain_name.toLowerCase().includes(search.toLowerCase()) ||
      reg.captain_email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || reg.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // ---- Player registrations filtering ----
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      search === "" ||
      `${reg.first_name} ${reg.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      reg.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || reg.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // ---- Player status update ----
  const updatePlayerStatus = async (regId, newStatus) => {
    const prev = registrations
    setRegistrations(
      registrations.map((r) =>
        r.id === regId ? { ...r, status: newStatus } : r
      )
    )
    setDetailsOpen(false)

    const supabase = createClient()
    const { error } = await supabase
      .from("registrations")
      .update({ status: newStatus })
      .eq("id", regId)

    if (error) {
      alert("Failed to update status: " + error.message)
      setRegistrations(prev)
    }
  }

  // ---- Send invoice ----
  const handleSendInvoice = async (regId) => {
    setInvoiceLoading(regId)
    setPaymentUrl(null)
    try {
      const res = await fetch("/api/admin/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_registration_id: regId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setPaymentUrl(data.payment_url)
      // Update local state
      setTeamRegistrations((prev) =>
        prev.map((r) =>
          r.id === regId ? { ...r, status: "invoice_sent" } : r
        )
      )
      router.refresh()
    } catch (err) {
      alert("Failed to create invoice: " + err.message)
    } finally {
      setInvoiceLoading(null)
    }
  }

  // ---- Manual mark as paid ----
  const [markingPaid, setMarkingPaid] = useState(null)

  const handleMarkPaid = async (regId) => {
    if (!confirm("Mark this registration as paid? This should only be used if Stripe didn't pick up the payment.")) {
      return
    }

    setMarkingPaid(regId)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("team_registrations")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", regId)

      if (error) throw error

      setTeamRegistrations((prev) =>
        prev.map((r) =>
          r.id === regId ? { ...r, status: "paid", paid_at: new Date().toISOString() } : r
        )
      )
      setDetailsOpen(false)
      router.refresh()
    } catch (err) {
      alert("Failed to update status: " + err.message)
    } finally {
      setMarkingPaid(null)
    }
  }

  const handleCopyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleCopyRosterLink = async (reg) => {
    if (!reg?.roster_token) {
      alert("This registration doesn't have a roster link yet.")
      return
    }
    const url = `${window.location.origin}/team-roster/${reg.roster_token}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedRosterId(reg.id)
      setTimeout(() => setCopiedRosterId(null), 2000)
    } catch {
      // Fallback: show the URL so admin can copy manually
      prompt("Copy this roster link:", url)
    }
  }

  const openTeamDetails = (reg) => {
    setSelectedRegistration({ ...reg, _type: "team" })
    setPaymentUrl(null)
    setCopied(false)
    setDetailsOpen(true)
  }

  const openPlayerDetails = (reg) => {
    setSelectedRegistration({ ...reg, _type: "player" })
    setDetailsOpen(true)
  }

  // ---- Stats ----
  const teamStats = {
    total: teamRegistrations.length,
    pending: teamRegistrations.filter((r) => r.status === "pending_payment")
      .length,
    invoiced: teamRegistrations.filter((r) => r.status === "invoice_sent")
      .length,
    paid: teamRegistrations.filter(
      (r) => r.status === "paid" || r.status === "roster_complete"
    ).length,
  }

  const playerStats = {
    total: registrations.length,
    pending: registrations.filter((r) => r.status === "pending").length,
    approved: registrations.filter((r) => r.status === "approved").length,
    rejected: registrations.filter((r) => r.status === "rejected").length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registrations</h1>
          <p className="text-muted-foreground mt-2">
            Manage team and player registrations
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={tab === "teams" ? "default" : "outline"}
          onClick={() => {
            setTab("teams")
            setSearch("")
            setStatusFilter("all")
          }}
        >
          <Users className="h-4 w-4 mr-2" />
          Team Registrations
          {teamStats.pending > 0 && (
            <Badge className="ml-2 bg-yellow-100 text-yellow-800">
              {teamStats.pending}
            </Badge>
          )}
        </Button>
        <Button
          variant={tab === "players" ? "default" : "outline"}
          onClick={() => {
            setTab("players")
            setSearch("")
            setStatusFilter("all")
          }}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Player Registrations
        </Button>
      </div>

      {/* ============ TEAM REGISTRATIONS TAB ============ */}
      {tab === "teams" && (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{teamStats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pending Review
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {teamStats.pending}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Invoice Sent
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {teamStats.invoiced}
                    </p>
                  </div>
                  <Send className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="text-2xl font-bold text-green-600">
                      {teamStats.paid}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by team name, captain, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "All" },
                { value: "pending_payment", label: "Pending" },
                { value: "invoice_sent", label: "Invoiced" },
                { value: "paid", label: "Paid" },
                { value: "roster_complete", label: "Complete" },
              ].map((s) => (
                <Button
                  key={s.value}
                  variant={statusFilter === s.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(s.value)}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Team Registrations Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Captain</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeamRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-sm border"
                            style={{ backgroundColor: reg.primary_color }}
                          />
                          {reg.team_name}
                        </div>
                      </TableCell>
                      <TableCell>{reg.captain_name}</TableCell>
                      <TableCell>{reg.captain_email}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            teamStatusColors[reg.status] || ""
                          }
                        >
                          {teamStatusLabels[reg.status] || reg.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(reg.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {reg.status === "pending_payment" && (
                            <Button
                              size="sm"
                              onClick={() => handleSendInvoice(reg.id)}
                              disabled={invoiceLoading === reg.id}
                            >
                              {invoiceLoading === reg.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <Send className="h-4 w-4 mr-1" />
                              )}
                              Send Invoice
                            </Button>
                          )}
                          {(reg.status === "pending_payment" || reg.status === "invoice_sent") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkPaid(reg.id)}
                              disabled={markingPaid === reg.id}
                            >
                              {markingPaid === reg.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <DollarSign className="h-4 w-4 mr-1" />
                              )}
                              Mark Paid
                            </Button>
                          )}
                          {reg.roster_token && reg.status !== "roster_complete" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyRosterLink(reg)}
                              title="Copy roster link to send to captain"
                            >
                              {copiedRosterId === reg.id ? (
                                <Check className="h-4 w-4 mr-1 text-green-500" />
                              ) : (
                                <Link2 className="h-4 w-4 mr-1" />
                              )}
                              {copiedRosterId === reg.id ? "Copied" : "Roster Link"}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTeamDetails(reg)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTeamRegistrations.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No team registrations found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* ============ PLAYER REGISTRATIONS TAB ============ */}
      {tab === "players" && (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{playerStats.total}</p>
                  </div>
                  <UserPlus className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {playerStats.pending}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-green-600">
                      {playerStats.approved}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">
                      {playerStats.rejected}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Player Registrations Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">
                        {reg.first_name} {reg.last_name}
                      </TableCell>
                      <TableCell>{reg.email}</TableCell>
                      <TableCell>{reg.position || "-"}</TableCell>
                      <TableCell className="capitalize">
                        {reg.experience_level || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`capitalize ${
                            playerStatusColors[reg.status] || ""
                          }`}
                        >
                          {reg.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(reg.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPlayerDetails(reg)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRegistrations.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No registrations found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* ============ DETAILS DIALOG ============ */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedRegistration?._type === "team"
                ? "Team Registration Details"
                : "Player Registration Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedRegistration?._type === "team"
                ? "Review team registration and send payment invoice"
                : "Review player registration information"}
            </DialogDescription>
          </DialogHeader>

          {/* ---- Team Details ---- */}
          {selectedRegistration?._type === "team" && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Team Name</p>
                  <p className="font-medium flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm inline-block border"
                      style={{
                        backgroundColor: selectedRegistration.primary_color,
                      }}
                    />
                    {selectedRegistration.team_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    className={
                      teamStatusColors[selectedRegistration.status] || ""
                    }
                  >
                    {teamStatusLabels[selectedRegistration.status] ||
                      selectedRegistration.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Captain</p>
                  <p className="font-medium">
                    {selectedRegistration.captain_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {selectedRegistration.captain_email}
                  </p>
                </div>
                {selectedRegistration.captain_phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {selectedRegistration.captain_phone}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Colors</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 border rounded-sm"
                      style={{
                        backgroundColor: selectedRegistration.primary_color,
                      }}
                    />
                    <div
                      className="w-6 h-6 border rounded-sm"
                      style={{
                        backgroundColor: selectedRegistration.secondary_color,
                      }}
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <p className="font-medium">
                    {formatDate(selectedRegistration.created_at)}
                  </p>
                </div>
                {selectedRegistration.paid_at && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="font-medium">
                      {formatDate(selectedRegistration.paid_at)}
                    </p>
                  </div>
                )}
              </div>

              {/* Invoice action */}
              {(selectedRegistration.status === "pending_payment" ||
                selectedRegistration.status === "invoice_sent") && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    {selectedRegistration.status === "pending_payment"
                      ? "Generate a payment link to send to the captain"
                      : "Generate a new payment link"}
                  </p>

                  {paymentUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={paymentUrl}
                          className="text-xs font-mono"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyUrl(paymentUrl)}
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Copy this link and send it to{" "}
                        <strong>{selectedRegistration.captain_email}</strong>
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={() =>
                        handleSendInvoice(selectedRegistration.id)
                      }
                      disabled={invoiceLoading === selectedRegistration.id}
                      className="w-full"
                    >
                      {invoiceLoading === selectedRegistration.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Generate Payment Link
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => handleMarkPaid(selectedRegistration.id)}
                    disabled={markingPaid === selectedRegistration.id}
                    className="w-full mt-2"
                  >
                    {markingPaid === selectedRegistration.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <DollarSign className="h-4 w-4 mr-2" />
                    )}
                    Mark as Paid Manually
                  </Button>
                </div>
              )}

              {/* Roster link (always available once registration exists) */}
              {selectedRegistration.roster_token &&
                selectedRegistration.status !== "roster_complete" && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Roster entry link for{" "}
                      <strong>{selectedRegistration.captain_email}</strong>.
                      Send this to the captain so they can add their players.
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/team-roster/${selectedRegistration.roster_token}`}
                        className="text-xs font-mono"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyRosterLink(selectedRegistration)}
                      >
                        {copiedRosterId === selectedRegistration.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* ---- Player Details ---- */}
          {selectedRegistration?._type === "player" && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {selectedRegistration.first_name}{" "}
                    {selectedRegistration.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    className={`capitalize ${
                      playerStatusColors[selectedRegistration.status] || ""
                    }`}
                  >
                    {selectedRegistration.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {selectedRegistration.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {selectedRegistration.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Position</p>
                  <p className="font-medium">
                    {selectedRegistration.position || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-medium capitalize">
                    {selectedRegistration.experience_level || "Not specified"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <p className="font-medium">
                    {formatDate(selectedRegistration.created_at)}
                  </p>
                </div>
              </div>

              {selectedRegistration.status === "pending" && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Update Status
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        updatePlayerStatus(selectedRegistration.id, "approved")
                      }
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        updatePlayerStatus(selectedRegistration.id, "waitlist")
                      }
                      className="flex-1"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Waitlist
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        updatePlayerStatus(selectedRegistration.id, "rejected")
                      }
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
