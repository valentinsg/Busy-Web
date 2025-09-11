export default function LoadingProducts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-6 w-36 bg-muted rounded" />
        <div className="h-8 w-28 bg-muted rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded" />
        ))}
      </div>
    </div>
  )
}
