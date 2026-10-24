// @vitest-environment node
import { NextRequest } from 'next/server'
import { getRedirectUrl, unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { describe, expect, it } from 'vitest'
import nextConfig from '../next.config'
import { SESSION_COOKIE, config, proxy } from './proxy'

function visit(path: string, cookie?: string) {
  const headers = cookie ? { cookie: `${SESSION_COOKIE}=${cookie}` } : undefined
  return proxy(new NextRequest(`http://localhost:3000${path}`, { headers }))
}

const passesThrough = (response: Response) => response.headers.get('x-middleware-next') === '1'

describe('proxy', () => {
  it.each(['/', '/dashboard'])('allows guests to access %s', (path) => {
    expect(passesThrough(visit(path))).toBe(true)
  })

  it('lets you in with a session cookie', () => {
    expect(passesThrough(visit('/', 'token'))).toBe(true)
  })

  it.each(['/sign-in', '/sign-up'])('shows %s when signed out', (path) => {
    expect(passesThrough(visit(path))).toBe(true)
  })

  it.each(['/sign-in', '/sign-up'])('sends you home from %s when signed in', (path) => {
    expect(getRedirectUrl(visit(path, 'token'))).toBe('http://localhost:3000/dashboard')
  })

  it.each([
    ['/', true],
    ['/sign-in', true],
    ['/some/page', true],
    ['/api/predict', false],
    ['/api/auth/me', false],
    ['/capture/abc123', false],
    ['/_next/static/chunks/main.js', false],
    ['/icon.svg', false],
  ])('runs on %s: %s', (url, runs) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig, url })).toBe(runs)
  })
})
