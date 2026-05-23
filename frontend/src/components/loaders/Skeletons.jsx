import { cn } from '@/utils'

export function Skeleton({ className }) {
  return (
    <div className={cn('shimmer-bg rounded-xl bg-bg-overlay', className)} />
  )
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-border p-0">
      <Skeleton className="w-full aspect-video rounded-none rounded-t-2xl" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function ReelCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-border">
      <Skeleton className="w-full aspect-[9/16] rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl border border-border p-5">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 glass rounded-2xl border border-border">
      <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-accent-primary animate-pulse shadow-glow" />
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-accent-primary/60"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PageLoader2() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-accent-primary"
            style={{ animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite alternate` }}
          />
        ))}
      </div>
    </div>
  )
}
