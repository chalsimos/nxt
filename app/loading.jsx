export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-soft-amber border-t-transparent"></div>
        <p className="mt-4 text-graphite">Loading...</p>
      </div>
    </div>
  )
}
