'use client'

import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { usePredict } from '@/hooks/use-predict'
import { checkImageFile } from '@/lib/image-file'
import { PageDropzone } from './page-dropzone'
import { PagePreview } from './page-preview'
import { RecognitionPanel } from './recognition-panel'

export function RecognitionWorkbench() {
  const [page, setPage] = useState<File | null>(null)
  const [rejection, setRejection] = useState<string | null>(null)
  const run = usePredict()
  const abortRef = useRef<AbortController | null>(null)

  function stopRun() {
    abortRef.current?.abort()
    abortRef.current = null
    run.reset()
  }

  function choosePage(file: File) {
    const checked = checkImageFile(file)
    if (!checked.ok) {
      setRejection(checked.reason)
      return
    }
    stopRun()
    setRejection(null)
    setPage(checked.file)
  }

  function removePage() {
    stopRun()
    setRejection(null)
    setPage(null)
  }

  function recognize() {
    if (!page) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    run.mutate({ file: page, signal: controller.signal })
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
    <div id="workbench" className="grid scroll-mt-28 items-start gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        {page ? (
          <PagePreview file={page} onReplace={choosePage} onRemove={removePage} />
        ) : (
          <PageDropzone onFile={choosePage} />
        )}
        {rejection && (
          <p role="alert" className="text-sm text-foreground">
            {rejection}
          </p>
        )}
      </div>

      <RecognitionPanel
        hasPage={page !== null}
        run={run}
        onRecognize={recognize}
        onCancel={stopRun}
      />
    </div>
  )
}
