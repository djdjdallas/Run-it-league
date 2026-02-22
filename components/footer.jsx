import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/10">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-display text-xl tracking-tight">
                <span className="bg-neon text-black px-1.5 py-0.5 inline-block">RUN</span>
                <span className="text-white ml-1">IT LEAGUE</span>
              </span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed">
              Competitive basketball, organized. Track teams, stats, and schedules all in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/teams" className="text-white/50 hover:text-neon transition-colors">
                  Teams
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="text-white/50 hover:text-neon transition-colors">
                  Schedule
                </Link>
              </li>
              <li>
                <Link href="/stats" className="text-white/50 hover:text-neon transition-colors">
                  Stats
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-white/50 hover:text-neon transition-colors">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* League */}
          <div>
            <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-4">
              League
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/teams" className="text-white/50 hover:text-neon transition-colors">
                  Standings
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="text-white/50 hover:text-neon transition-colors">
                  Games
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-white/50 hover:text-neon transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin */}
          <div>
            <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-4">
              Admin
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/admin" className="text-white/50 hover:text-neon transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-white/30">
            &copy; {new Date().getFullYear()} Run It League. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
