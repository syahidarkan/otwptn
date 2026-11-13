export default function PublicLoading() {
  return (
    <div className="w-full min-h-screen bg-white animate-pulse">
      {/* Hero Skeleton */}
      <div className="w-full py-20 px-6 max-w-5xl mx-auto flex flex-col items-center text-center space-y-6">
        <div className="h-7 w-48 bg-amber-200/60 rounded-full" />
        <div className="h-14 w-full max-w-2xl bg-amber-100 rounded-2xl" />
        <div className="h-5 w-full max-w-lg bg-gray-100 rounded-xl" />
        <div className="h-12 w-48 bg-amber-400/60 rounded-full mt-4" />
      </div>
    </div>
  )
}
