'use client'

import { useTheme } from 'next-themes'
import { ThinkingOrb, type OrbState } from 'thinking-orbs'

type LoadingOrbProps = {
  state?: OrbState
  size?: 20 | 32 | 64
  theme?: 'dark' | 'light' | 'invert'
  paused?: boolean
  label?: string
  className?: string
}

export function LoadingOrb({
  state = 'working',
  size = 20,
  theme,
  paused,
  label,
  className,
}: LoadingOrbProps) {
  const { resolvedTheme } = useTheme()
  const resolved = theme === 'invert' ? (resolvedTheme === 'dark' ? 'light' : 'dark') : theme

  return (
    <ThinkingOrb
      state={state}
      size={size}
      theme={resolved}
      paused={paused}
      className={className}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}
