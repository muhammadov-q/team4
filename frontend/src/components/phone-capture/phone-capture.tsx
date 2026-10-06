'use client'

import {
  CameraIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  ImagesIcon,
  Link2OffIcon,
  type LucideIcon,
} from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import {
  isSessionGone,
  useCaptureSession,
  useUploadCaptureImage,
} from '@/hooks/use-capture-session'
import { IMAGE_ACCEPT, checkImageFile } from '@/lib/image-file'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { LoadingOrb } from '@/components/ui/loading-orb'
import { Skeleton } from '@/components/ui/skeleton'

const TIPS = [
  'Lay the page flat in good light',
  'Fill the frame with the page',
  'Hold still so the digits stay sharp',
]

export function PhoneCapture({ sessionId }: { sessionId: string }) {
  const session = useCaptureSession(sessionId)
  const upload = useUploadCaptureImage(sessionId)
  const cameraRef = useRef<HTMLInputElement>(null)
  const libraryRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [rejection, setRejection] = useState<string | null>(null)

  function send(file: File) {
    const checked = checkImageFile(file)
    if (!checked.ok) {
      setRejection(checked.reason)
      return
    }
    setRejection(null)
    setPhoto(checked.file)
    upload.mutate(checked.file)
  }

  if (session.isPending) return <CaptureSkeleton />
  if (isSessionGone(session.error) || isSessionGone(upload.error)) {
    return (
      <Notice
        icon={Link2OffIcon}
        title="This link no longer works"
        message="On your computer, choose Use your phone again and scan the new code."
      />
    )
  }
  if (session.isError) {
    return (
      <Notice
        icon={CircleAlertIcon}
        title="Couldn't open this link"
        message={session.error.message}
      >
        <Button size="lg" className="w-full" onClick={() => session.refetch()}>
          Try again
        </Button>
      </Notice>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
      {photo ? <PhotoPreview file={photo} /> : <Intro />}

      {upload.isPending && (
        <div className="flex items-center gap-4" aria-live="polite">
          <LoadingOrb state="working" size={32} />
          <div>
            <p className="font-medium">Sending to your computer</p>
            <p className="text-sm text-muted-foreground">Keep this page open.</p>
          </div>
        </div>
      )}
      {upload.isSuccess && (
        <div role="status" className="flex items-center gap-4">
          <CircleCheckIcon className="size-8 shrink-0 text-success" />
          <div>
            <p className="font-medium">Sent to your computer</p>
            <p className="text-sm text-muted-foreground">Take another photo to replace it.</p>
          </div>
        </div>
      )}
      {upload.isError && (
        <div role="alert" className="flex gap-3 rounded-xl bg-muted p-5">
          <CircleAlertIcon className="mt-0.5 size-5 shrink-0 text-foreground" />
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <p className="font-medium">Couldn&apos;t send the photo</p>
              <p className="text-sm text-muted-foreground">{upload.error.message}</p>
            </div>
            {photo && (
              <Button variant="outline" size="sm" onClick={() => send(photo)}>
                Try again
              </Button>
            )}
          </div>
        </div>
      )}
      {rejection && (
        <p role="alert" className="text-sm text-foreground">
          {rejection}
        </p>
      )}

      {!upload.isPending && (
        <div className="mt-auto space-y-3">
          <Button
            size="lg"
            className="h-14 w-full text-base"
            onClick={() => cameraRef.current?.click()}
          >
            <CameraIcon className="size-5" />
            {photo ? 'Take another photo' : 'Take photo'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => libraryRef.current?.click()}
          >
            <ImagesIcon />
            Choose from photos
          </Button>
        </div>
      )}

      <PhotoInput ref={cameraRef} label="Photo of the page" accept="image/*" camera onFile={send} />
      <PhotoInput
        ref={libraryRef}
        label="Photo from your library"
        accept={IMAGE_ACCEPT}
        onFile={send}
      />
    </div>
  )
}

function Intro() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Chip>Linked to your computer</Chip>
        <h1 className="text-3xl font-semibold">Take a photo of the page</h1>
        <p className="text-muted-foreground">It goes straight to the page on your computer.</p>
      </div>
      <ol className="space-y-3 rounded-2xl bg-card p-5">
        {TIPS.map((tip, index) => (
          <li key={tip} className="flex gap-3">
            <span className="font-mono text-sm leading-6 text-muted-foreground">{index + 1}</span>
            <span>{tip}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function PhotoPreview({ file }: { file: File }) {
  const attachPreview = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return
      const url = URL.createObjectURL(file)
      img.src = url
      return () => URL.revokeObjectURL(url)
    },
    [file]
  )

  return (
    <div className="grid place-items-center overflow-hidden rounded-2xl bg-card p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={attachPreview}
        alt="Photo you took"
        className="block max-h-[40svh] w-auto max-w-full rounded-md"
      />
    </div>
  )
}

function PhotoInput({
  ref,
  label,
  accept,
  camera = false,
  onFile,
}: {
  ref: React.Ref<HTMLInputElement>
  label: string
  accept: string
  camera?: boolean
  onFile: (file: File) => void
}) {
  return (
    <input
      ref={ref}
      type="file"
      accept={accept}
      capture={camera ? 'environment' : undefined}
      aria-label={label}
      tabIndex={-1}
      className="sr-only"
      onChange={(event) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (file) onFile(file)
      }}
    />
  )
}

function Notice({
  icon: Icon,
  title,
  message,
  children,
}: {
  icon: LucideIcon
  title: string
  message: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="space-y-4 pt-10">
        <Icon className="size-8 text-foreground" />
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{message}</p>
      </div>
      {children && <div className="mt-auto">{children}</div>}
    </div>
  )
}

function CaptureSkeleton() {
  return (
    <div aria-hidden className="flex flex-1 flex-col gap-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <Skeleton className="h-36 w-full rounded-2xl" />
      </div>
      <div className="mt-auto space-y-3">
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  )
}
