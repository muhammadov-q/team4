'use client'

import { useTheme } from 'next-themes'
import { ThinkingOrb, type OrbState } from 'thinking-orbs'

type LoadingOrbProps = {
  state?: OrbState
  size?: 20 | 32 | 64
  /** Pin the ink when the orb sits on a surface that ignores the page theme.
   *  `invert` suits a primary button, which is dark in light mode and vice versa. */
  theme?: 'dark' | 'light' | 'invert'
  /** Freeze on the current frame, for an idle orb that should still read as the same object. */
  paused?: boolean
  /** Omit when adjacent text names the wait; the orb is then hidden from assistive tech. */
  label?: string
  className?: string
}

/** Sole point of contact with `thinking-orbs`, so the dependency can be swapped in one place. */
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
