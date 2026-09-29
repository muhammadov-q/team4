import { describe, expect, it } from 'vitest'
import { highlightJson } from './highlight-json'

describe('highlightJson', () => {
  it('splits keys, strings, numbers and literals', () => {
    const json = JSON.stringify({ prediction: 250000.5, model_version: 'mock', ok: true }, null, 2)
    const kinds = highlightJson(json)
      .filter((t) => t.kind !== 'plain')
      .map((t) => [t.kind, t.text])

    expect(kinds).toEqual([
      ['key', '"prediction"'],
      ['literal', '250000.5'],
      ['key', '"model_version"'],
      ['string', '"mock"'],
      ['key', '"ok"'],
      ['literal', 'true'],
    ])
  })

  it('keeps every character, so the text reads the same', () => {
    const json = JSON.stringify({ a: 'say "hi"', b: [1, -2e3, null] }, null, 2)
    expect(
      highlightJson(json)
        .map((t) => t.text)
        .join('')
    ).toBe(json)
  })
})
