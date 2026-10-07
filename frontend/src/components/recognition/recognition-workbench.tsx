'use client'

import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { toast } from 'sonner'
import { usePhoneLink } from '@/hooks/use-phone-link'
import { usePredict } from '@/hooks/use-predict'
import { checkImageFile } from '@/lib/image-file'
import { PhoneLinkBar } from '@/components/phone-capture/phone-link-bar'
import { PhoneLinkDialog } from '@/components/phone-capture/phone-link-dialog'
import { ImageCropper } from './image-cropper'
import { PageDropzone } from './page-dropzone'
import { PagePreview } from './page-preview'
import { RecognitionPanel } from './recognition-panel'

export function RecognitionWorkbench({ lanAddress = null }: { lanAddress?: string | null }) {
  const [page, setPage] = useState<File | null>(null)
  const [rejection, setRejection] = useState<string | null>(null)
  const [cropping, setCropping] = useState(false)

  const run = usePredict()
  const abortRef = useRef<AbortController | null>(null)

  function stopRun() {
    abortRef.current?.abort()
    abortRef.current = null
    run.reset()
  }

  function choosePage(file: File): boolean {
    const checked = checkImageFile(file)

    if (!checked.ok) {
      setRejection(checked.reason)
      return false
    }

    stopRun()
    setRejection(null)
    setCropping(false)
    setPage(checked.file)
    return true
  }

  const phone = usePhoneLink((file) => {
    if (choosePage(file)) toast.success('Photo received from your phone')
  })
  const phoneActive = phone.status === 'waiting' || phone.status === 'linked'

  function removePage() {
    stopRun()
    setRejection(null)
    setCropping(false)
    setPage(null)
  }

  function applyCrop(file: File) {
    stopRun()
    setRejection(null)
    setPage(file)
    setCropping(false)
  }

  function recognize() {
    if (!page) return

    abortRef.current?.abort()

    const controller = new AbortController()
    abortRef.current = controller

    run.mutate({
      file: page,
      signal: controller.signal,
    })
  }

  const onPaste = useEffectEvent((event: ClipboardEvent) => {
    const file = Array.from(event.clipboardData?.files ?? []).find((f) =>
      f.type.startsWith('image/')
    )

    if (!file) return

    event.preventDefault()
    choosePage(file)
  })

  useEffect(() => {
    const listener = (event: ClipboardEvent) => onPaste(event)

    window.addEventListener('paste', listener)

    return () => window.removeEventListener('paste', listener)
  }, [])

  useEffect(() => () => abortRef.current?.abort(), [])

  return (
    <div id="workbench" className="grid scroll-mt-28 grid-cols-1 items-start gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        {phoneActive && (
          <PhoneLinkBar
            linked={phone.status === 'linked'}
            onShowCode={phone.start}
            onStop={phone.stop}
          />
        )}

        {page ? (
          cropping ? (
            <ImageCropper file={page} onApply={applyCrop} onCancel={() => setCropping(false)} />
          ) : (
            <PagePreview
              file={page}
              predictions={run.isSuccess ? run.data.response.predictions : undefined}
              onReplace={choosePage}
              onCrop={() => {
                stopRun()
                setCropping(true)
              }}
              onRemove={removePage}
              onUsePhone={phoneActive ? undefined : phone.start}
            />
          )
        ) : (
          <PageDropzone onFile={choosePage} onUsePhone={phone.start} />
        )}

        {rejection && (
          <p role="alert" className="text-sm text-foreground">
            {rejection}
          </p>
        )}
      </div>

      <RecognitionPanel
        hasPage={page !== null && !cropping}
        run={run}
        onRecognize={recognize}
        onCancel={stopRun}
      />

      <PhoneLinkDialog
        open={phone.open}
        onOpenChange={phone.setOpen}
        status={phone.status}
        sessionId={phone.sessionId}
        lanAddress={lanAddress}
        onNewCode={phone.start}
      />
    </div>
  )
}
