import { RecognitionWorkbench } from '@/components/recognition/recognition-workbench'

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-rubric uppercase">Recognition</p>
        <h1 className="mt-2 font-display text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
          Read a manuscript page
        </h1>
        <p className="mt-3 text-muted-foreground">
          Upload a scan of a single page and send it to the recognition model.
        </p>
      </div>
      <RecognitionWorkbench />
    </main>
  )
}
