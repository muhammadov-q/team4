import { connection } from 'next/server'
import { RecognitionWorkbench } from '@/components/recognition/recognition-workbench'
import { lanAddress } from '@/lib/lan-address'

export default async function DashboardPage() {
  await connection()

  return (
    <>
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
          Read a manuscript page
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Upload a photo of the page. The model reads each word, and you can pick any word to see
          its translation.
        </p>
      </div>

      <RecognitionWorkbench lanAddress={lanAddress()} />
    </>
  )
}
