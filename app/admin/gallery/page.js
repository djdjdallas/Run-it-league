import { getGalleryPhotos } from "@/lib/queries"
import GalleryAdminClient from "./gallery-client"

export default async function AdminGalleryPage() {
  const photos = await getGalleryPhotos()

  return <GalleryAdminClient initialPhotos={photos} />
}
