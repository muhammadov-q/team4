'use client'

import { useEffect, useState } from 'react'

/** Milliseconds since `since` (a Date.now() timestamp), ticking while it's set. */
export function useElapsed(since: number | null, intervalMs = 100): number {
  const [now, setNow] = useState(0)

  useEffect(() => {
    if (since === null) return
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [since, intervalMs])

  return since === null ? 0 : Math.max(0, now - since)
}
