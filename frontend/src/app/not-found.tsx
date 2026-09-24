import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <div className="relative flex max-w-md flex-col items-center text-center">
        <p className="font-display text-[clamp(7rem,18vw,12rem)] leading-none font-medium text-foreground/10 select-none">
          404
        </p>
        <h1 className="-mt-2 text-2xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This page doesn&apos;t exist or has moved. Check the address, or start again from the home
          page.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to Codex Lens</Link>
        </Button>
      </div>
    </main>
  )
}
