import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SavedRecognition } from '@/components/history/saved-recognition'

export const metadata: Metadata = { title: 'Result' }

export default async function SavedRecognitionPage({
  params,
}: PageProps<'/dashboard/history/[id]'>) {
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id < 1) notFound()

  return <SavedRecognition id={id} />
}
