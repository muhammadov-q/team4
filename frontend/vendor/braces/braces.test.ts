import braces from 'braces'
import { describe, expect, it } from 'vitest'

describe('patched braces', () => {
  it('expands patterns as before', () => {
    expect(braces('src/{app,lib}/*.ts', { expand: true })).toEqual(['src/app/*.ts', 'src/lib/*.ts'])
    expect(braces('a{1..3}', { expand: true })).toEqual(['a1', 'a2', 'a3'])
    expect(braces('a/{b,{c,d}}', { expand: true })).toEqual(['a/b', 'a/c', 'a/d'])
  })

  it('does not overflow the stack on deeply nested patterns', () => {
    const pattern = '{'.repeat(4900) + 'a' + '}'.repeat(4900)

    expect(() => braces(pattern)).not.toThrow()
    expect(() => braces(pattern, { expand: true })).not.toThrow()
  })
})
