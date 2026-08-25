import "./globals.css"
import { Header } from "@/components/header"
import { getLeagues } from "@/lib/leagues"

export const metadata = {
  title: "Run It League - Basketball League Management",
  description: "Track teams, players, schedules, and stats for your basketball league",
}

export default async function RootLayout({ children }) {
  // The header needs the league list to render its switcher. getLeagues() is
  // request-cached and degrades to a single league before the multi-league
  // migration has been applied.
  const leagues = await getLeagues()

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Header leagues={leagues} />
        {children}
      </body>
    </html>
  )
}
