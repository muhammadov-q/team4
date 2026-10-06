import { connection } from 'next/server'
import { RecognitionWorkbench } from '@/components/recognition/recognition-workbench'
import { lanAddress } from '@/lib/lan-address'

export default async function HomePage() {
  await connection()

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 pb-24 lg:pb-32">
      <section className="relative -mt-24 flex flex-col items-center pt-36 pb-12 text-center lg:pt-40 lg:pb-14">
        <div aria-hidden className="absolute inset-0 -z-10 bg-grid" />
        <h1 className="text-heading font-semibold">Read handwritten digits</h1>
        <p className="mt-3 max-w-xl text-lg text-foreground/80">
          Upload a photo and the model finds each digit and reads it.
        </p>
      </section>
      <RecognitionWorkbench lanAddress={lanAddress()} />
    </main>
  )
}
