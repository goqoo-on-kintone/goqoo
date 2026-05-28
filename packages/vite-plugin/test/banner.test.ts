import { describe, it, expect } from 'vitest'
import { buildDevInfoBanner } from '../src/banner'

describe('buildDevInfoBanner', () => {
  it('window.__devinfo__[entryName] への代入文を生成する', () => {
    const banner = buildDevInfoBanner('foo', {
      nodeEnv: 'development',
      commitHash: 'abc1234',
      builtAt: '2026-05-28T00:00:00.000Z',
    })
    expect(banner).toContain('window.__devinfo__')
    expect(banner).toContain('"foo"')
    expect(banner).toContain('abc1234')
    expect(banner.trim().startsWith(';')).toBe(true)
  })
})
