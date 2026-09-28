import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-6">
      <section className="-mt-24 flex flex-col items-center gap-5 pt-44 pb-24 lg:pt-52 lg:pb-32">
        <Skeleton className="h-[clamp(44px,7vw,88px)] w-full max-w-3xl rounded-xl" />
        <Skeleton className="h-[clamp(44px,7vw,88px)] w-1/2 rounded-xl" />
        <Skeleton className="mt-4 h-6 w-[36rem] max-w-full" />
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
