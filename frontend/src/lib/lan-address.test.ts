import type { NetworkInterfaceInfo } from 'node:os'
import { describe, expect, it } from 'vitest'
import { pickLanAddress } from './lan-address'

const ipv4 = (address: string, internal = false) =>
  ({ address, family: 'IPv4', internal }) as NetworkInterfaceInfo
const ipv6 = (address: string) =>
  ({ address, family: 'IPv6', internal: false }) as NetworkInterfaceInfo

describe('pickLanAddress', () => {
  it('returns the first external IPv4 address', () => {
    expect(
      pickLanAddress({
        lo0: [ipv4('127.0.0.1', true)],
        en0: [ipv6('fe80::1'), ipv4('192.168.1.20')],
        bridge100: [ipv4('192.168.64.1')],
      })
    ).toBe('192.168.1.20')
  })

  it('skips link-local addresses', () => {
    expect(pickLanAddress({ en5: [ipv4('169.254.10.2')], en0: [ipv4('10.0.0.7')] })).toBe(
      '10.0.0.7'
    )
  })

  it('returns null when only loopback is up', () => {
    expect(pickLanAddress({ lo0: [ipv4('127.0.0.1', true)], en0: undefined })).toBeNull()
  })
})
