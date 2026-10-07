import { networkInterfaces } from 'node:os'
import type { NextConfig } from 'next'

import { version } from './package.json'

const networkAddresses = Object.values(networkInterfaces())
  .flat()
  .flatMap((info) => (info && info.family === 'IPv4' && !info.internal ? [info.address] : []))
const privateRanges = [
  '10.*.*.*',
  '192.168.*.*',
  ...Array.from({ length: 16 }, (_, i) => `172.${16 + i}.*.*`),
]

const nextConfig: NextConfig = {
  output: 'standalone',

  reactCompiler: true,
  typedRoutes: true,

  skipTrailingSlashRedirect: true,

  allowedDevOrigins: [...networkAddresses, ...privateRanges],

  env: { NEXT_PUBLIC_APP_VERSION: version },
}

export default nextConfig
