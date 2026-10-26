import { vi } from 'vitest'
import type { WordSelection } from '@/hooks/use-word-selection'

export function makeSelection(overrides: Partial<WordSelection> = {}): WordSelection {
  return { selected: null, hovered: null, select: vi.fn(), hover: vi.fn(), ...overrides }
}
