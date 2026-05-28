import { describe, it, expect } from 'vitest'
import { resolveDevInfo } from '../src/devinfo'

describe('resolveDevInfo', () => {
  it('mode と commitHash と builtAt(ISO) を返す', () => {
    const info = resolveDevInfo('production')
    expect(info.nodeEnv).toBe('production')
    expect(typeof info.commitHash).toBe('string')
    expect(() => new Date(info.builtAt).toISOString()).not.toThrow()
    expect(new Date(info.builtAt).toISOString()).toBe(info.builtAt)
  })
})
