import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, vi } from 'vitest'

afterEach(cleanup)

// jsdom has no canvas, which thinking-orbs draws on. The stand-in keeps the orb's
// accessible name so tests can still find it.
vi.mock('thinking-orbs', () => ({
  ThinkingOrb: (props: { 'aria-label'?: string; 'aria-hidden'?: boolean }) =>
    createElement('span', {
      'data-testid': 'thinking-orb',
      role: 'img',
      'aria-label': props['aria-label'],
      'aria-hidden': props['aria-hidden'],
    }),
}))

// jsdom doesn't implement object URLs; previews only need a stable string.
if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => 'blob:preview'
  URL.revokeObjectURL = () => {}
}
