import { describe, expect, it } from 'vitest'
import { formatDateTime, formatDuration, formatPercent } from './format'

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

describe('formatPercent', () => {
  it.each([
    [0, '0%'],
    [0.004, '0%'],
    [0.925, '93%'],
    [1, '100%'],
  ])('formats %d as %s', (fraction, expected) => {
    expect(formatPercent(fraction)).toBe(expected)
  })
})

describe('formatDateTime', () => {
  it('shows the day, month, year and time', () => {
    expect(formatDateTime('2026-10-15T12:00:00Z')).toMatch(/^15 Oct 2026, \d{2}:\d{2}$/)
  })
})
