import { getSponsors } from "@/lib/queries"
import { resolveLeague, leagueWordmark } from "@/lib/leagues"
import RegisterLandingClient from "./register-landing-client"

export async function generateMetadata({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)
  return {
    title: `Register - ${league?.name || "Run It League"}`,
    description: `Register your team for the ${league?.name || "Run It League"}`,
  }
}

export default async function RegisterPage({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)
  const sponsors = await getSponsors()

  return (
    <RegisterLandingClient
      sponsors={sponsors}
      leagueName={league.name}
      wordmark={leagueWordmark(league)}
    />
  )
}
