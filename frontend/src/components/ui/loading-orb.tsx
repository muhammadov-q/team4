'use client'

import { ThinkingOrb, type OrbState } from 'thinking-orbs'

export function LoadingOrb({
  state = 'working',
  size = 20,
  paused,
}: {
  state?: OrbState
  size?: 20 | 32 | 64
  paused?: boolean
}) {
  return <ThinkingOrb state={state} size={size} paused={paused} aria-hidden />
}
