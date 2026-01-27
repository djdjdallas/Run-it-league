import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Footer } from "@/components/footer"
import { getStatLeaders } from "@/lib/queries"

export const metadata = {
  title: "Stats Leaders - Run It League",
  description: "View statistical leaders in the Run It League",
}

export default async function StatsPage() {
  const [pointsLeaders, reboundsLeaders, assistsLeaders, stealsLeaders, blocksLeaders] = await Promise.all([
    getStatLeaders("points", 10),
    getStatLeaders("rebounds", 10),
    getStatLeaders("assists", 10),
    getStatLeaders("steals", 10),
    getStatLeaders("blocks", 10),
  ])

  const StatTable = ({ leaders, statName }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Player</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-center">GP</TableHead>
          <TableHead className="text-center">{statName}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaders.map((leader, index) => {
          const team = leader.player?.team
          return (
            <TableRow key={leader.player_id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                <Link
                  href={`/players/${leader.player?.id}`}
                  className="hover:underline font-medium"
                >
                  {leader.player?.name}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/teams/${team?.id}`}
                  className="hover:underline text-muted-foreground"
                >
                  {team?.abbreviation || "-"}
                </Link>
              </TableCell>
              <TableCell className="text-center">{leader.games}</TableCell>
              <TableCell className="text-center font-bold">{leader.avg}</TableCell>
            </TableRow>
          )
        })}
        {leaders.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
              No stats recorded yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Stats Leaders</h1>
            <p className="text-muted-foreground mt-2">
              League leaders in all major statistical categories
            </p>
          </div>

          <Tabs defaultValue="points" className="space-y-6">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="points">Points</TabsTrigger>
              <TabsTrigger value="rebounds">Rebounds</TabsTrigger>
              <TabsTrigger value="assists">Assists</TabsTrigger>
              <TabsTrigger value="steals">Steals</TabsTrigger>
              <TabsTrigger value="blocks">Blocks</TabsTrigger>
            </TabsList>

            <TabsContent value="points">
              <Card>
                <CardHeader>
                  <CardTitle>Points Per Game Leaders</CardTitle>
                </CardHeader>
                <CardContent>
                  <StatTable leaders={pointsLeaders} statName="PPG" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rebounds">
              <Card>
                <CardHeader>
                  <CardTitle>Rebounds Per Game Leaders</CardTitle>
                </CardHeader>
                <CardContent>
                  <StatTable leaders={reboundsLeaders} statName="RPG" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assists">
              <Card>
                <CardHeader>
                  <CardTitle>Assists Per Game Leaders</CardTitle>
                </CardHeader>
                <CardContent>
                  <StatTable leaders={assistsLeaders} statName="APG" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="steals">
              <Card>
                <CardHeader>
                  <CardTitle>Steals Per Game Leaders</CardTitle>
                </CardHeader>
                <CardContent>
                  <StatTable leaders={stealsLeaders} statName="SPG" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="blocks">
              <Card>
                <CardHeader>
                  <CardTitle>Blocks Per Game Leaders</CardTitle>
                </CardHeader>
                <CardContent>
                  <StatTable leaders={blocksLeaders} statName="BPG" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Top 3 Quick View */}
          <div className="grid gap-6 md:grid-cols-3 mt-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top Scorer</CardTitle>
              </CardHeader>
              <CardContent>
                {pointsLeaders[0] ? (
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{
                        backgroundColor: pointsLeaders[0].player?.team?.primary_color || "#666",
                      }}
                    >
                      {pointsLeaders[0].player?.number || "?"}
                    </div>
                    <div>
                      <Link
                        href={`/players/${pointsLeaders[0].player?.id}`}
                        className="font-semibold hover:underline"
                      >
                        {pointsLeaders[0].player?.name}
                      </Link>
                      <div className="text-2xl font-bold">
                        {pointsLeaders[0].avg} PPG
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No data</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top Rebounder</CardTitle>
              </CardHeader>
              <CardContent>
                {reboundsLeaders[0] ? (
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{
                        backgroundColor: reboundsLeaders[0].player?.team?.primary_color || "#666",
                      }}
                    >
                      {reboundsLeaders[0].player?.number || "?"}
                    </div>
                    <div>
                      <Link
                        href={`/players/${reboundsLeaders[0].player?.id}`}
                        className="font-semibold hover:underline"
                      >
                        {reboundsLeaders[0].player?.name}
                      </Link>
                      <div className="text-2xl font-bold">
                        {reboundsLeaders[0].avg} RPG
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No data</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top Playmaker</CardTitle>
              </CardHeader>
              <CardContent>
                {assistsLeaders[0] ? (
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{
                        backgroundColor: assistsLeaders[0].player?.team?.primary_color || "#666",
                      }}
                    >
                      {assistsLeaders[0].player?.number || "?"}
                    </div>
                    <div>
                      <Link
                        href={`/players/${assistsLeaders[0].player?.id}`}
                        className="font-semibold hover:underline"
                      >
                        {assistsLeaders[0].player?.name}
                      </Link>
                      <div className="text-2xl font-bold">
                        {assistsLeaders[0].avg} APG
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No data</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
