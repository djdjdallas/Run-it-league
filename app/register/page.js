import { getSponsors } from "@/lib/queries"
import RegisterLandingClient from "./register-landing-client"

export const metadata = {
  title: "Register - Run It League",
  description: "Register your team for the Run It League",
}

export default async function RegisterPage() {
  const sponsors = await getSponsors()

  return <RegisterLandingClient sponsors={sponsors} />
}
