// Shared loading state for the public pages.
//
// Deliberately NOT placed at the app root: a loading.js creates a Suspense
// boundary for its whole subtree, and once Next starts streaming that
// fallback the response status is already committed -- so a notFound() below
// it can no longer set 404, and every missing team, player or game returned
// 200 with the not-found page rendered inside it.
//
// It therefore lives only on leaf segments that never call notFound().
export function PageLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#080808]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-neon" />
        <p className="text-white/40 text-xs uppercase tracking-[0.3em]">Loading</p>
      </div>
    </div>
  )
}
