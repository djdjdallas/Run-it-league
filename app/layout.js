import "./globals.css"
import { Header } from "@/components/header"

export const metadata = {
  title: "Run It League - Basketball League Management",
  description: "Track teams, players, schedules, and stats for your basketball league",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Header />
        {children}
      </body>
    </html>
  )
}
