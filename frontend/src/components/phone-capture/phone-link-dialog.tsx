'use client'

import { CircleAlertIcon, CopyIcon } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import type { PhoneLinkStatus } from '@/hooks/use-phone-link'
import { captureUrl } from '@/lib/capture-url'
import { Annotation } from '@/components/ui/annotation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LoadingOrb } from '@/components/ui/loading-orb'
import { Skeleton } from '@/components/ui/skeleton'
import { LinkDot } from './link-dot'

interface PhoneLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  status: PhoneLinkStatus
  sessionId: string | null
  lanAddress: string | null
  onNewCode: () => void
}

const STEPS = [
  'Open the camera on your phone and point it at the code',
  'Tap the link that appears',
  'Take a photo of the page',
]

export function PhoneLinkDialog({ open, onOpenChange, ...body }: PhoneLinkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Use your phone</DialogTitle>
          <DialogDescription>
            Take a photo of the page with your phone. It shows up here.
          </DialogDescription>
        </DialogHeader>
        <LinkBody {...body} />
      </DialogContent>
    </Dialog>
  )
}

function LinkBody({
  status,
  sessionId,
  lanAddress,
  onNewCode,
}: Omit<PhoneLinkDialogProps, 'open' | 'onOpenChange'>) {
  if (status === 'failed') {
    return (
      <Problem
        title="Couldn't make a code"
        message="Check that the recognition service is running, then try again."
        action="Try again"
        onAction={onNewCode}
      />
    )
  }
  if (status === 'expired') {
    return (
      <Problem
        title="This code has expired"
        message="A code stops working 30 minutes after its last photo."
        action="New code"
        onAction={onNewCode}
      />
    )
  }

  const url = sessionId ? captureUrl(sessionId, window.location, lanAddress) : null
  if (sessionId && !url) {
    return (
      <Problem
        title="Your phone can't open localhost"
        message="Open this page with your computer's network address instead of localhost, then try again."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {url ? <QrTile url={url} /> : <Skeleton className="size-50 shrink-0 rounded-xl" />}
        <ol className="space-y-4 self-stretch sm:pt-2">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="font-mono text-sm leading-6 text-muted-foreground">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex items-center gap-4 rounded-xl bg-muted px-4 py-3" aria-live="polite">
        {status === 'linked' ? (
          <>
            <LinkDot className="mx-3" />
            <div>
              <p className="font-medium">Phone linked</p>
              <p className="text-sm text-muted-foreground">New photos replace the page.</p>
            </div>
          </>
        ) : (
          <>
            <LoadingOrb state="searching" size={32} />
            <div>
              <p className="font-medium">Waiting for a photo</p>
              <p className="text-sm text-muted-foreground">This window closes when it arrives.</p>
            </div>
          </>
        )}
      </div>

      {url ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Your phone needs to be on the same Wi-Fi as this computer.
          </p>
          <div className="flex items-center gap-2">
            <Annotation className="min-w-0 flex-1 truncate select-all" title={url}>
              {url}
            </Annotation>
            <Button variant="ghost" size="sm" onClick={() => copyLink(url)}>
              <CopyIcon />
              Copy link
            </Button>
          </div>
        </div>
      ) : (
        <Skeleton className="h-4 w-3/4" />
      )}
    </div>
  )
}

function QrTile({ url }: { url: string }) {
  return (
    <div className="shrink-0 rounded-xl bg-white p-3">
      <QRCodeSVG
        value={url}
        size={176}
        level="M"
        fgColor="#0e0e0e"
        bgColor="#ffffff"
        role="img"
        aria-label="QR code that opens the camera page on your phone"
      />
    </div>
  )
}

function Problem({
  title,
  message,
  action,
  onAction,
}: {
  title: string
  message: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="space-y-6">
      <div role="alert" className="flex gap-3 rounded-xl bg-muted p-5">
        <CircleAlertIcon className="mt-0.5 size-5 shrink-0 text-foreground" />
        <div className="space-y-1">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
      {action && <Button onClick={onAction}>{action}</Button>}
    </div>
  )
}

async function copyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url)
    toast.success('Link copied')
  } catch {
    toast.error("Couldn't copy the link. Click it to select it, then copy.")
  }
}
