import { networkInterfaces, type NetworkInterfaceInfo } from 'node:os'

export function pickLanAddress(interfaces: NodeJS.Dict<NetworkInterfaceInfo[]>): string | null {
  for (const info of Object.values(interfaces).flat()) {
    if (info?.family === 'IPv4' && !info.internal && !info.address.startsWith('169.254.')) {
      return info.address
    }
  }
  return null
}

export function lanAddress(): string | null {
  return pickLanAddress(networkInterfaces())
}
