import { describe, expect, it } from 'vitest'
import { boxToPercent, confidenceOf, hasBox, readDigits, type DigitPrediction } from './digits'

const digit = (value: number, probabilities: Record<string, number>): DigitPrediction => ({
  digit: value,
  probabilities,
  box: { x: 0, y: 0, w: 10, h: 10 },
})

describe('readDigits', () => {
  it('joins the digits in the order the backend returns them', () => {
    expect(readDigits([digit(2, {}), digit(5, {}), digit(0, {})])).toBe('250')
  })

  it('is empty when nothing was found', () => {
    expect(readDigits([])).toBe('')
  })
})

describe('confidenceOf', () => {
  it("reads the predicted digit's probability from the string keys", () => {
    expect(confidenceOf(digit(7, { '1': 0.08, '7': 0.92 }))).toBe(0.92)
  })

  it('is 0 when the predicted digit has no probability', () => {
    expect(confidenceOf(digit(7, { '1': 1 }))).toBe(0)
  })
})

describe('hasBox', () => {
  it.each([
    [{ x: 0, y: 0, w: 0, h: 0 }, false],
    [{ x: 5, y: 5, w: 10, h: 0 }, false],
    [{ x: 5, y: 5, w: 10, h: 20 }, true],
  ])('%o has a box: %s', (box, expected) => {
    expect(hasBox(box)).toBe(expected)
  })
})

describe('boxToPercent', () => {
  it('turns pixel coordinates into percentages of the image', () => {
    expect(boxToPercent({ x: 100, y: 50, w: 200, h: 100 }, { width: 1000, height: 500 })).toEqual({
      left: 10,
      top: 10,
      width: 20,
      height: 20,
    })
  })
})
