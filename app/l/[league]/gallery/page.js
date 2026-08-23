import { getGalleryPhotos, getSponsors } from "@/lib/queries"
import { resolveLeague, leagueWordmark } from "@/lib/leagues"
import GalleryClient from "./gallery-client"

export async function generateMetadata({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)
  return {
    title: `Gallery - ${league?.name || "Run It League"}`,
    description: `Photos and highlights from the ${league?.name || "Run It League"}`,
  }
}

export default async function GalleryPage({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)

  const [photos, sponsors] = await Promise.all([
    getGalleryPhotos(league.id),
    getSponsors(),
  ])

  return <GalleryClient wordmark={leagueWordmark(league)} photos={photos} sponsors={sponsors} />
}
