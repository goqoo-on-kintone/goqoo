import { describe, it, expect } from 'vitest'
import { applyServerDefaults, buildBootstrapScript } from '../src/dev-server'

describe('applyServerDefaults', () => {
  it('https/cors を既定で有効化し、未指定 port を補完する', () => {
    const result = applyServerDefaults({})
    expect(result.server?.cors).toBe(true)
    expect(result.server?.https).toBeTruthy()
    expect(result.server?.port).toBe(59000)
  })

  it('ユーザー指定を上書きしない', () => {
    const result = applyServerDefaults({ server: { port: 4000, cors: false } })
    expect(result.server?.port).toBe(4000)
    expect(result.server?.cors).toBe(false)
  })
})

describe('buildBootstrapScript', () => {
  it('@vite/client と実エントリを動的 import するクラシックスクリプトを返す', () => {
    const script = buildBootstrapScript('foo', 'src/apps/foo.ts')
    expect(script).toContain('@vite/client')
    expect(script).toContain('/src/apps/foo.ts')
    expect(script).toContain('script')
    expect(script).toContain('module')
  })
})
