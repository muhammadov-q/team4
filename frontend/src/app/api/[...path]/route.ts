// Catch-all proxy for /api/* to the backend. A Route Handler rather than a next.config
// rewrite: rewrites hand upstream redirects (FastAPI's trailing-slash 307) to the
// browser, which then calls the backend cross-origin. Following them here keeps the
// browser on /api and the backend free of CORS. Transport only, no business logic.

export const dynamic = 'force-dynamic'

const BACKEND_URL = (process.env.API_INTERNAL_URL || 'http://localhost:8000').replace(/\/$/, '')

// Hop-by-hop headers (RFC 9110 §7.6.1) must not be forwarded. fetch recomputes host
// and content-length for the upstream request. `expect: 100-continue` (curl sends it for
// bodies over 1 MB) is answered here, and undici's fetch refuses to send it anyway.
const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
  'expect',
])

// fetch has already decompressed the body, so the upstream encoding no longer applies.
const STALE_RESPONSE_HEADERS = new Set([...HOP_BY_HOP, 'content-encoding'])

async function proxy(request: Request): Promise<Response> {
  // The raw pathname keeps the caller's encoding and trailing slash.
  const { pathname, search } = new URL(request.url)
  const url = `${BACKEND_URL}${pathname.replace(/^\/api/, '')}${search}`

  const headers = new Headers()
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key)) headers.set(key, value)
  })

  // Buffered, not streamed: a streamed body can't be replayed when following a 307.
  const body =
    request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer()

  let upstream: Response
  try {
    upstream = await fetch(url, { method: request.method, headers, body, redirect: 'follow' })
  } catch (error) {
    console.error(`[api proxy] ${request.method} ${url} failed:`, error)
    return Response.json(
      { detail: 'The recognition service is not reachable. Check that the backend is running.' },
      { status: 502 }
    )
  }

  const responseHeaders = new Headers()
  upstream.headers.forEach((value, key) => {
    if (!STALE_RESPONSE_HEADERS.has(key)) responseHeaders.append(key, value)
  })

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as HEAD,
  proxy as OPTIONS,
}
