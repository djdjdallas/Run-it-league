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
  UserPlus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Eye,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  waitlist: "bg-blue-100 text-blue-800",
}

const statusIcons = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  waitlist: Clock,
}

export default function RegistrationsClient({ initialRegistrations }) {
  const [registrations, setRegistrations] = useState(initialRegistrations)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Filter registrations
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

  const updateStatus = (regId, newStatus) => {
    setRegistrations(
      registrations.map((r) =>
        r.id === regId ? { ...r, status: newStatus } : r
      )
    )
    setDetailsOpen(false)
  }

  const openDetails = (reg) => {
    setSelectedRegistration(reg)
    setDetailsOpen(true)
  }

  // Stats
  const stats = {
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
            Review and manage player registrations
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
                  {stats.pending}
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
                  {stats.approved}
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
                  {stats.rejected}
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

      {/* Registrations Table */}
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
              {filteredRegistrations.map((reg) => {
                const StatusIcon = statusIcons[reg.status] || Clock
                return (
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
                          statusColors[reg.status] || ""
                        }`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {reg.status}
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
                )
              })}
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

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>
              Review player registration information
            </DialogDescription>
          </DialogHeader>

          {selectedRegistration && (
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
                      statusColors[selectedRegistration.status] || ""
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
                        updateStatus(selectedRegistration.id, "approved")
                      }
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateStatus(selectedRegistration.id, "waitlist")
                      }
                      className="flex-1"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Waitlist
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        updateStatus(selectedRegistration.id, "rejected")
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
