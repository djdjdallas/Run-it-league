import { Trophy } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Trophy className="h-6 w-6" />
              <span className="font-bold">Run It League</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your go-to platform for basketball league management.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/teams" className="hover:text-foreground transition-colors">
                  Teams
                </Link>
              </li>
              <li>
                <Link href="/players" className="hover:text-foreground transition-colors">
                  Players
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="hover:text-foreground transition-colors">
                  Schedule
                </Link>
              </li>
              <li>
                <Link href="/stats" className="hover:text-foreground transition-colors">
                  Stats
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">League</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Standings
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="hover:text-foreground transition-colors">
                  Games
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Admin</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/admin" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Run It League. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
