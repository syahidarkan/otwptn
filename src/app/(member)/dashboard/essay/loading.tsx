export default function EssayLoading() {
  return (
    <div className="w-full px-6 md:px-8 py-10 animate-pulse">
      {/* Header skeleton */}
      <div className="rounded-3xl bg-amber-400/20 dark:bg-amber-950/30 border border-amber-300/40 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div className="space-y-3 w-full max-w-lg">
          <div className="h-5 w-32 bg-amber-400/40 rounded-full" />
          <div className="h-8 w-64 bg-amber-400/50 rounded-xl" />
          <div className="h-4 w-96 bg-amber-400/30 rounded-lg" />
        </div>
        <div className="w-36 h-11 bg-amber-400/60 rounded-full flex-shrink-0" />
      </div>

      {/* Row skeletons */}
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="rounded-3xl bg-white dark:bg-[#1c1d22] border border-gray-100 dark:border-[#2c2d33] p-5 flex items-center gap-4 shadow-xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-gray-200 dark:bg-zinc-800 rounded-md" />
              <div className="h-3 w-32 bg-gray-100 dark:bg-zinc-800/60 rounded-md" />
            </div>
            <div className="w-20 h-7 bg-amber-100 dark:bg-amber-950/60 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
