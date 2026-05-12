import Link from "next/link"
import { notFound } from "next/navigation"
import { getTeamById, getAllPlayersByTeam } from "@/lib/queries"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Pencil, Plus, Users } from "lucide-react"

export async function generateMetadata({ params }) {
  const { id } = await params
  const team = await getTeamById(id)
  return {
    title: `${team?.name || "Team"} - Admin - Run It League`,
  }
}

export default async function AdminTeamDetailPage({ params }) {
  const { id } = await params
  const [team, players] = await Promise.all([
    getTeamById(id),
    getAllPlayersByTeam(id),
  ])

  if (!team) notFound()

  const activePlayers = players.filter((p) => p.is_active)
  const inactivePlayers = players.filter((p) => !p.is_active)

  return (
    <div>
      <Link href="/admin/teams">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teams
        </Button>
      </Link>

      {/* Team header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        {team.logo_url ? (
          <img
            src={team.logo_url}
            alt={team.name}
            className="w-16 h-16 object-cover rounded-full"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
            style={{ backgroundColor: team.primary_color || "#000" }}
          >
            {team.abbreviation?.substring(0, 2) ||
              team.name.substring(0, 2).toUpperCase()}
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            {team.abbreviation && (
              <Badge variant="outline">{team.abbreviation}</Badge>
            )}
            <span>
              {team.wins}-{team.losses}
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-3 border"
                style={{ backgroundColor: team.primary_color }}
                title="Primary"
              />
              <span
                className="inline-block w-3 h-3 border"
                style={{ backgroundColor: team.secondary_color }}
                title="Secondary"
              />
            </span>
          </div>
        </div>

        <Link href="/admin/teams">
          <Button variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Edit Team
          </Button>
        </Link>
      </div>

      {/* Roster */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold">
                Roster ({activePlayers.length} active
                {inactivePlayers.length > 0
                  ? `, ${inactivePlayers.length} inactive`
                  : ""}
                )
              </h2>
            </div>
            <Link href="/admin/players">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Player
              </Button>
            </Link>
          </div>

          {players.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mb-4">
                No players on this team yet.
              </p>
              <Link href="/admin/players">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Player
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Position</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">
                    Height
                  </TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">
                      {player.number ?? "-"}
                    </TableCell>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell className="text-center">
                      {player.position ? (
                        <Badge variant="outline">{player.position}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      {player.height || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={player.is_active ? "success" : "secondary"}
                      >
                        {player.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/players/${player.id}`}>
                        <Button variant="ghost" size="sm">
                          View Stats
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
