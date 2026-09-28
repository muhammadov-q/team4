import { describe, expect, it } from 'vitest'
import { formatDuration } from './format'

describe('formatDuration', () => {
  it.each([
    [0, '0 ms'],
    [340.4, '340 ms'],
    [999, '999 ms'],
    [1000, '1.0 s'],
    [2449, '2.4 s'],
  ])('formats %d ms as %s', (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected)
  })
})
