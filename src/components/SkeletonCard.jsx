export default function SkeletonCard({ variant = 'default', count = 1 }) {
  const cards = Array.from({ length: count })

  const renderCard = (_, i) => {
    if (variant === 'compact') {
      return (
        <div
          key={i}
          aria-hidden="true"
          className="bg-card backdrop-blur-md border border-border rounded-2xl p-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-muted rounded w-2/3 shimmer" />
              <div className="h-2.5 bg-muted rounded w-1/3 shimmer" />
            </div>
          </div>
        </div>
      )
    }

    if (variant === 'list') {
      return (
        <div
          key={i}
          aria-hidden="true"
          className="bg-card backdrop-blur-md border border-border rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-muted shimmer shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4 shimmer" />
              <div className="h-3 bg-muted rounded w-1/2 shimmer" />
              <div className="h-3 bg-muted rounded w-5/6 shimmer" />
            </div>
          </div>
        </div>
      )
    }

    if (variant === 'grid') {
      return (
        <div
          key={i}
          aria-hidden="true"
          className="bg-card backdrop-blur-md border border-border rounded-2xl overflow-hidden"
        >
          <div className="w-full aspect-[4/3] bg-muted shimmer" />
          <div className="p-3 space-y-2">
            <div className="h-3.5 bg-muted rounded w-3/4 shimmer" />
            <div className="h-3 bg-muted rounded w-1/2 shimmer" />
          </div>
        </div>
      )
    }

    return (
      <div
        key={i}
        aria-hidden="true"
        className="min-w-[260px] bg-card backdrop-blur-md border border-border rounded-2xl p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-muted shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 shimmer" />
            <div className="h-3 bg-muted rounded w-1/2 shimmer" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full shimmer" />
          <div className="h-3 bg-muted rounded w-5/6 shimmer" />
        </div>
      </div>
    )
  }

  return (
    <div role="status" aria-busy="true" className={count > 1 ? 'space-y-3' : ''}>
      <span className="sr-only">Chargement…</span>
      {cards.map(renderCard)}
    </div>
  )
}