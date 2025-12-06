export function ArchiveSkeleton() {
  const heights = ['h-40', 'h-56', 'h-64', 'h-52'];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className={`relative overflow-hidden rounded-xl border border-border/40 bg-muted/40 animate-pulse ${
            heights[i % heights.length]
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10" />
        </div>
      ))}
    </div>
  );
}
