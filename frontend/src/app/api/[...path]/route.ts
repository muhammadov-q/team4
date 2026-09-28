export const dynamic = 'force-dynamic'

const BACKEND_URL = (process.env.API_INTERNAL_URL || 'http://localhost:8000').replace(/\/$/, '')

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

const STALE_RESPONSE_HEADERS = new Set([...HOP_BY_HOP, 'content-encoding'])

async function proxy(request: Request): Promise<Response> {
  const { pathname, search } = new URL(request.url)
  const url = `${BACKEND_URL}${pathname.replace(/^\/api/, '')}${search}`

  const headers = new Headers()
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key)) headers.set(key, value)
  })

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
