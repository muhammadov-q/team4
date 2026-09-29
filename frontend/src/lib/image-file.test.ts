import { describe, expect, it } from 'vitest'
import { makeFile } from '@/test/render'
import { IMAGE_ACCEPT, MAX_IMAGE_BYTES, checkImageFile, formatBytes } from './image-file'

describe('checkImageFile', () => {
  it.each([
    ['page.jpg', 'image/jpeg'],
    ['page.png', 'image/png'],
    ['page.tiff', 'image/tiff'],
  ])('accepts %s', (name, type) => {
    const result = checkImageFile(makeFile(name, type))
    expect(result.ok).toBe(true)
  })

  it('fills in a missing MIME type from the extension', () => {
    const result = checkImageFile(makeFile('folio-12r.TIF', ''))
    expect(result.ok && result.file.type).toBe('image/tiff')
  })

  it('keeps the original file when the browser typed it', () => {
    const file = makeFile('page.png', 'image/png')
    const result = checkImageFile(file)
    expect(result.ok && result.file).toBe(file)
  })

  it.each([
    ['notes.pdf', 'application/pdf'],
    ['scan.gif', 'image/gif'],
    ['README', ''],
  ])('rejects %s', (name, type) => {
    const result = checkImageFile(makeFile(name, type))
    expect(result).toEqual({ ok: false, reason: `${name} is not a JPG, PNG or TIFF image.` })
  })

  it('rejects an empty file', () => {
    expect(checkImageFile(makeFile('page.png', 'image/png', 0))).toEqual({
      ok: false,
      reason: 'page.png is empty.',
    })
  })

  it('accepts exactly 50 MB and rejects one byte more', () => {
    expect(checkImageFile(makeFile('page.png', 'image/png', MAX_IMAGE_BYTES)).ok).toBe(true)
    expect(checkImageFile(makeFile('page.png', 'image/png', MAX_IMAGE_BYTES + 1))).toEqual({
      ok: false,
      reason: 'page.png is larger than 50 MB.',
    })
  })
})

describe('IMAGE_ACCEPT', () => {
  it('lists MIME types and extensions for the file picker', () => {
    expect(IMAGE_ACCEPT.split(',')).toEqual(
      expect.arrayContaining(['image/jpeg', 'image/png', 'image/tiff', '.tif', '.jpeg'])
    )
  })
})

describe('formatBytes', () => {
  it.each([
    [512, '512 B'],
    [1536, '1.5 KB'],
    [20 * 1024, '20 KB'],
    [2.4 * 1024 * 1024, '2.4 MB'],
    [3 * 1024 ** 3, '3.0 GB'],
  ])('formats %d bytes as %s', (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected)
  })
})
