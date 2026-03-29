"use client"

import { useState } from "react"
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
  ClipboardList,
  Search,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Eye,
  Users,
  Copy,
  Check,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

const statusColors = {
  registered: "bg-blue-100 text-blue-800",
  pending_payment: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  roster_complete: "bg-emerald-100 text-emerald-800",
  payment_expired: "bg-red-100 text-red-800",
}

const statusLabels = {
  registered: "Registered",
  pending_payment: "Pending Payment",
  paid: "Paid",
  roster_complete: "Roster Complete",
  payment_expired: "Expired",
}

export default function TeamRegistrationsClient({ initialRegistrations }) {
  const [registrations] = useState(initialRegistrations)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(null)

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      search === "" ||
      reg.team_name.toLowerCase().includes(search.toLowerCase()) ||
      reg.captain_name.toLowerCase().includes(search.toLowerCase()) ||
      reg.captain_email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || reg.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const copyEmail = async (email) => {
    try {
      await navigator.clipboard.writeText(email)
      setCopiedEmail(email)
      setTimeout(() => setCopiedEmail(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const openDetails = (reg) => {
    setSelectedRegistration(reg)
    setDetailsOpen(true)
  }

  const stats = {
    total: registrations.length,
    registered: registrations.filter((r) => r.status === "registered").length,
    rosterComplete: registrations.filter((r) => r.status === "roster_complete").length,
    paid: registrations.filter((r) => r.status === "paid").length,
  }

  const uniqueStatuses = [...new Set(registrations.map((r) => r.status))]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Registrations</h1>
          <p className="text-muted-foreground mt-2">
            View registered teams and captain emails for invoicing
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Registered</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.registered}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Roster Complete</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.rosterComplete}
                </p>
              </div>
              <Users className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.paid}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
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
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          {uniqueStatuses.map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {statusLabels[status] || status}
            </Button>
          ))}
        </div>
      </div>

      {/* Registrations Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead>Captain</TableHead>
                <TableHead>Captain Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: reg.primary_color }}
                      />
                      {reg.team_name}
                    </div>
                  </TableCell>
                  <TableCell>{reg.captain_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{reg.captain_email}</span>
                      <button
                        onClick={() => copyEmail(reg.captain_email)}
                        className="p-1 hover:bg-muted rounded"
                        title="Copy email"
                      >
                        {copiedEmail === reg.captain_email ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>{reg.captain_phone || "-"}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[reg.status] || ""}>
                      {statusLabels[reg.status] || reg.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(reg.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetails(reg)}
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
                    No team registrations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Team Registration Details</DialogTitle>
            <DialogDescription>
              Review team registration and captain contact info
            </DialogDescription>
          </DialogHeader>

          {selectedRegistration && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Team Name</p>
                  <p className="font-medium">{selectedRegistration.team_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    className={statusColors[selectedRegistration.status] || ""}
                  >
                    {statusLabels[selectedRegistration.status] || selectedRegistration.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Captain Name</p>
                  <p className="font-medium">{selectedRegistration.captain_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Captain Email</p>
                  <p className="font-medium flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {selectedRegistration.captain_email}
                    <button
                      onClick={() => copyEmail(selectedRegistration.captain_email)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      {copiedEmail === selectedRegistration.captain_email ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Captain Phone</p>
                  <p className="font-medium flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {selectedRegistration.captain_phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Team Colors</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: selectedRegistration.primary_color }}
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: selectedRegistration.secondary_color }}
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <p className="font-medium">
                    {formatDate(selectedRegistration.created_at)}
                  </p>
                </div>
              </div>
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
