import { getGalleryPhotos } from "@/lib/queries"
import GalleryAdminClient from "./gallery-client"
import { getAdminLeague } from "@/lib/leagues"

export default async function AdminGalleryPage() {
  const league = await getAdminLeague()
  const photos = await getGalleryPhotos(league.id)

  return <GalleryAdminClient leagueId={league.id} initialPhotos={photos} />
}
