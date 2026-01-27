import { getGalleryPhotos, getSponsors } from "@/lib/queries"
import GalleryClient from "./gallery-client"

export const metadata = {
  title: "Gallery - Run It League",
  description: "Photos and highlights from the Run It League",
}

export default async function GalleryPage() {
  const [photos, sponsors] = await Promise.all([
    getGalleryPhotos(),
    getSponsors(),
  ])

  return <GalleryClient photos={photos} sponsors={sponsors} />
}
