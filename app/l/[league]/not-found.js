import Link from "next/link"

export default function LeagueNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#080808] text-center px-8">
      <p className="text-neon text-xs font-bold uppercase tracking-[0.3em] mb-3">404</p>
      <h1 className="font-display text-4xl md:text-5xl text-white mb-4">League Not Found</h1>
      <p className="text-white/60 max-w-md mb-8">
        That league does not exist, or is no longer active.
      </p>
      <Link
        href="/"
        className="bg-neon text-black px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-neon/90 transition-colors"
      >
        Back to Run It League
      </Link>
    </div>
  )
}
