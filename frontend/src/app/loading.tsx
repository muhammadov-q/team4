import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mb-8 max-w-2xl space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-11 w-full max-w-md" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <Skeleton className="h-117 rounded-xl" />
        <div className="space-y-5 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="mx-auto size-16 rounded-full" />
        </div>
      </div>
    </main>
  )
}
