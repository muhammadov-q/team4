// Upload rules from user story A1: JPG, PNG or TIFF, at most 50 MB.
export const MAX_IMAGE_BYTES = 50 * 1024 * 1024

const TYPE_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  tif: 'image/tiff',
  tiff: 'image/tiff',
}

const ACCEPTED_TYPES = new Set(Object.values(TYPE_BY_EXTENSION))

/** For the file input's `accept`. The extensions cover browsers that report no MIME
 *  type, which happens with TIFF. */
export const IMAGE_ACCEPT = [
  ...ACCEPTED_TYPES,
  ...Object.keys(TYPE_BY_EXTENSION).map((ext) => `.${ext}`),
].join(',')

export type ImageCheck = { ok: true; file: File } | { ok: false; reason: string }

/** Validates a page image. A file the browser left untyped comes back typed from its
 *  extension, because the backend rejects anything that isn't image/*. */
export function checkImageFile(file: File): ImageCheck {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  const type = file.type || TYPE_BY_EXTENSION[extension] || ''

  if (!ACCEPTED_TYPES.has(type)) {
    return { ok: false, reason: `${file.name} is not a JPG, PNG or TIFF image.` }
  }
  if (file.size === 0) {
    return { ok: false, reason: `${file.name} is empty.` }
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, reason: `${file.name} is larger than 50 MB.` }
  }
  if (file.type === type) return { ok: true, file }
  return { ok: true, file: new File([file], file.name, { type, lastModified: file.lastModified }) }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`
}
