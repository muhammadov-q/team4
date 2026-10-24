'use client'

import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { ErrorNotice } from '@/components/error-notice'
import { DigitBoxes } from '@/components/recognition/digit-boxes'
import { RecognitionResult } from '@/components/recognition/recognition-result'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecognition } from '@/hooks/use-recognitions'
import { recognitionImageUrl, type Recognition } from '@/lib/api/recognitions'
import type { ImageSize } from '@/lib/digits'
import { formatDateTime } from '@/lib/format'

export function SavedRecognition({ id }: { id: number }) {
  const query = useRecognition(id)

  return (
    <>
      <div className="mb-10 space-y-3">
        <Link
          href="/dashboard/history"
          className="inline-flex items-center gap-2 rounded-lg text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          History
        </Link>

        {query.isSuccess ? (
          <>
            <h1 className="truncate text-3xl font-semibold tracking-tight lg:text-4xl">
              {query.data.filename || 'Untitled page'}
            </h1>
            <p className="text-lg text-muted-foreground">
              Read on {formatDateTime(query.data.created_at)}
            </p>
          </>
        ) : (
          <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">Result</h1>
        )}
      </div>

      {query.isPending && <SavedRecognitionSkeleton />}

      {query.isError && (
        <Card>
          <ErrorNotice title="Could not open this result" message={query.error.message} />
        </Card>
      )}

      {query.isSuccess && (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
          <SavedPage key={query.data.id} recognition={query.data} />
          <Card className="lg:sticky lg:top-8">
            <RecognitionResult recognition={query.data} />
          </Card>
        </div>
      )}
    </>
  )
}

function SavedPage({ recognition }: { recognition: Recognition }) {
  const [size, setSize] = useState<ImageSize | null>(null)
  const [failed, setFailed] = useState(false)

  return (
    <div className="grid min-h-72 place-items-center overflow-hidden rounded-2xl bg-card p-4">
      {failed ? (
        <p className="max-w-xs p-6 text-center text-sm text-muted-foreground">
          This browser can&apos;t show this image (TIFF usually).
        </p>
      ) : (
        <div className="relative max-w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={recognitionImageUrl(recognition.id)}
            alt={`Saved page ${recognition.filename}`}
            onLoad={(event) =>
              setSize({
                width: event.currentTarget.naturalWidth,
                height: event.currentTarget.naturalHeight,
              })
            }
            onError={() => setFailed(true)}
            className="block max-h-[70vh] w-auto max-w-full rounded-md"
          />
          {size && <DigitBoxes predictions={recognition.predictions} image={size} />}
        </div>
      )}
    </div>
  )
}

function SavedRecognitionSkeleton() {
  return (
    <div aria-hidden className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
      <Skeleton className="h-80 rounded-2xl" />
      <Card className="space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((cell) => (
            <Skeleton key={cell} className="h-16 rounded-xl" />
          ))}
        </div>
      </Card>
    </div>
  )
}
