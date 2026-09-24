import type { NextConfig } from 'next'

import { version } from './package.json'

// Backend calls use the proxy in src/app/api/[...path]/route.ts, not rewrites.
const nextConfig: NextConfig = {
  // Produces .next/standalone for the Docker runtime stage. Harmless for dev/start.
  output: 'standalone',

  reactCompiler: true,
  typedRoutes: true,

  // Don't 308 /api/foo/ to /api/foo before the proxy runs; FastAPI treats the two
  // as different routes.
  skipTrailingSlashRedirect: true,

  env: { NEXT_PUBLIC_APP_VERSION: version },
}

export default nextConfig
