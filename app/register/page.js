import { getTeams, getSponsors } from "@/lib/queries"
import RegisterClient from "./register-client"

export const metadata = {
  title: "Register - Run It League",
  description: "Register to play in the Run It League",
}

export default async function RegisterPage() {
  const [teams, sponsors] = await Promise.all([
    getTeams(),
    getSponsors(),
  ])

  return <RegisterClient teams={teams} sponsors={sponsors} />
}
