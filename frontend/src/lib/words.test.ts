import { describe, expect, it } from 'vitest'
import {
  boxToPercent,
  confidenceOf,
  groupLines,
  hasBox,
  positionOf,
  readText,
  type Word,
} from './words'

const word = (text: string, line = 0, probabilities: Record<string, number> = {}): Word => ({
  text,
  probabilities,
  box: { x: 0, y: 0, w: 10, h: 10 },
  line,
  gloss: null,
})

const page = [word('Φύσις', 0), word('ἐστί', 0), word('δύναμις', 1)]

describe('readText', () => {
  it('joins the words in the order the backend returns them', () => {
    expect(readText(page)).toBe('Φύσις ἐστί δύναμις')
  })

  it('is empty when nothing was found', () => {
    expect(readText([])).toBe('')
  })
})

describe('groupLines', () => {
  it('puts each word on its line, numbered from 1, and keeps its index', () => {
    expect(groupLines(page)).toEqual([
      {
        number: 1,
        words: [
          { word: page[0], index: 0 },
          { word: page[1], index: 1 },
        ],
      },
      { number: 2, words: [{ word: page[2], index: 2 }] },
    ])
  })

  it('has no lines when nothing was found', () => {
    expect(groupLines([])).toEqual([])
  })
})

describe('positionOf', () => {
  it.each([
    [0, { line: 1, word: 1 }],
    [1, { line: 1, word: 2 }],
    [2, { line: 2, word: 1 }],
  ])('word %i sits at %o', (index, position) => {
    expect(positionOf(page, index)).toEqual(position)
  })
})

describe('confidenceOf', () => {
  it("reads the predicted text's probability", () => {
    expect(confidenceOf(word('7', 0, { '1': 0.08, '7': 0.92 }))).toBe(0.92)
  })

  it('is 0 when the predicted text has no probability', () => {
    expect(confidenceOf(word('7', 0, { '1': 1 }))).toBe(0)
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
