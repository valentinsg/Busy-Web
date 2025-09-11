export default function LoadingCoupons() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-6 w-36 bg-muted rounded" />
        <div className="h-8 w-28 bg-muted rounded" />
      </div>
      <div className="rounded-lg border divide-y">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-40 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
