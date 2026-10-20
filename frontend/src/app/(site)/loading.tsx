import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-6">
      <section className="-mt-24 flex flex-col items-center gap-3 pt-36 pb-12 lg:pt-40 lg:pb-14">
        <Skeleton className="mb-2 h-6 w-48" />
        <Skeleton className="h-11 w-full max-w-md rounded-xl" />
        <Skeleton className="h-7 w-[28rem] max-w-full" />
      </section>
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <div className="space-y-8 rounded-2xl bg-card p-8">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="size-16 rounded-full" />
        </div>
      </div>
    </main>
  )
}
