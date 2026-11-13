export default function DashboardLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="rounded-3xl bg-amber-400/20 dark:bg-amber-950/30 border border-amber-300/40 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 w-full max-w-md">
          <div className="h-4 w-28 bg-amber-400/40 rounded-full" />
          <div className="h-8 w-56 bg-amber-400/50 rounded-xl" />
          <div className="h-4 w-72 bg-amber-400/30 rounded-lg" />
        </div>
        <div className="w-32 h-10 bg-amber-400/60 rounded-full flex-shrink-0" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="rounded-3xl bg-white dark:bg-[#1c1d22] border border-gray-100 dark:border-[#2c2d33] p-6 space-y-4 shadow-xs"
          >
            <div className="h-6 w-32 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-20 w-full bg-gray-100 dark:bg-zinc-800/60 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
