import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it.each(['caption', 'heading', 'display'])('keeps text-%s next to a text colour', (size) => {
    expect(cn(`text-${size}`, 'text-muted-foreground')).toBe(`text-${size} text-muted-foreground`)
  })

  it('still lets a later size win over an earlier one', () => {
    expect(cn('text-caption', 'text-sm')).toBe('text-sm')
  })
})
