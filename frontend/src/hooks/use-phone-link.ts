'use client'

import { useEffect, useEffectEvent, useState } from 'react'
import {
  isSessionGone,
  useCaptureSession,
  useCapturedPhoto,
  useCreateCaptureSession,
  useDeleteCaptureSession,
} from './use-capture-session'

export type PhoneLinkStatus = 'off' | 'creating' | 'failed' | 'waiting' | 'linked' | 'expired'

export function usePhoneLink(onPhoto: (file: File) => void) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [openedAt, setOpenedAt] = useState<number | null>(null)
  const create = useCreateCaptureSession()
  const remove = useDeleteCaptureSession()
  const session = useCaptureSession(sessionId, { poll: true })
  const uploadCount = session.data?.upload_count ?? 0
  const photo = useCapturedPhoto(sessionId, uploadCount)

  const handOver = useEffectEvent(onPhoto)
  useEffect(() => {
    if (photo.data) handOver(photo.data)
  }, [photo.data])

  let status: PhoneLinkStatus
  if (sessionId === null) {
    status = create.isPending ? 'creating' : create.isError ? 'failed' : 'off'
  } else if (isSessionGone(session.error)) {
    status = 'expired'
  } else {
    status = uploadCount > 0 ? 'linked' : 'waiting'
  }

  function start() {
    if (status === 'creating' || status === 'waiting' || status === 'linked') {
      setOpenedAt(uploadCount)
      return
    }
    setOpenedAt(0)
    setSessionId(null)
    create.mutate(undefined, { onSuccess: (created) => setSessionId(created.id) })
  }

  function stop() {
    if (sessionId) remove.mutate(sessionId)
    setSessionId(null)
    setOpenedAt(null)
  }

  return {
    status,
    sessionId,
    open: openedAt !== null && uploadCount <= openedAt,
    setOpen: (open: boolean) => setOpenedAt(open ? uploadCount : null),
    start,
    stop,
  }
}
