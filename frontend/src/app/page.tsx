import { RecognitionWorkbench } from '@/components/recognition/recognition-workbench'

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 pb-24 lg:pb-32">
      <section className="relative -mt-24 flex flex-col items-center pt-44 pb-24 text-center lg:pt-52 lg:pb-32">
        <div aria-hidden className="absolute inset-0 -z-10 bg-grid" />
        <h1 className="text-display font-semibold">
          Read a manuscript page.
          <br />
          Line by line.
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-foreground/80 sm:text-xl">
          Upload a scan of a single page and send it to the recognition model. It is a mock for now;
          the trained models come next.
        </p>
      </section>
      <RecognitionWorkbench />
    </main>
  )
}
