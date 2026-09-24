// Same-origin proxy (src/app/api/[...path]/route.ts); never the backend URL directly.
export const API_URL = '/api'

/** A failed request with the backend's own message. `status` 0 means no response. */
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Reads a FastAPI error body. HTTPException puts a string in `detail`; validation
 *  errors put an array of `{msg}` objects there. */
export function errorMessageFromBody(body: unknown, fallback: string): string {
  const detail = (body as { detail?: unknown } | null)?.detail
  if (typeof detail === 'string' && detail) return detail
  if (Array.isArray(detail)) {
    const message = detail
      .map((e) =>
        typeof e === 'object' && e !== null && 'msg' in e ? String(e.msg) : JSON.stringify(e)
      )
      .join('; ')
    return message || fallback
  }
  return fallback
}

export interface ApiRequestOptions {
  method?: string
  /** Sent as multipart when it's FormData, JSON otherwise. */
  body?: unknown
  /** Error message when the backend doesn't send one. */
  fallback?: string
  signal?: AbortSignal
}

/** The shared request skeleton: throws ApiError on failure, else returns the parsed
 *  JSON (undefined for empty or 204 bodies). `path` is the segment after /api. */
export async function apiRequest<T>(path: string, opts: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, fallback = 'Request failed', signal } = opts
  const init: RequestInit = { method, signal }
  if (body instanceof FormData) {
    // No Content-Type: the browser adds the multipart boundary itself.
    init.body = body
  } else if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' }
    init.body = JSON.stringify(body)
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, init)
  } catch (err) {
    if (signal?.aborted) throw err
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0)
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => null)
    throw new ApiError(errorMessageFromBody(errBody, fallback), res.status)
  }
  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}
