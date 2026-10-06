type PageLocation = Pick<Location, 'protocol' | 'hostname' | 'port' | 'origin'>

function isLoopback(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]'
  )
}

export function captureUrl(
  sessionId: string,
  page: PageLocation,
  lanAddress: string | null
): string | null {
  const path = `/capture/${encodeURIComponent(sessionId)}`
  if (!isLoopback(page.hostname)) return `${page.origin}${path}`
  if (!lanAddress) return null
  const port = page.port ? `:${page.port}` : ''
  return `${page.protocol}//${lanAddress}${port}${path}`
}
