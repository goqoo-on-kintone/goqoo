import { describe, it, expect } from 'vitest'
import { applyServerDefaults, buildBootstrapScript } from '../src/dev-server'

describe('applyServerDefaults', () => {
  it('cors を既定で有効化し、未指定 port を補完する（https は basic-ssl が担当）', () => {
    const result = applyServerDefaults({})
    expect(result.server?.cors).toBe(true)
    expect(result.server?.port).toBe(59000)
  })

  it('ユーザー指定を上書きしない', () => {
    const result = applyServerDefaults({ server: { port: 4000, cors: false } })
    expect(result.server?.port).toBe(4000)
    expect(result.server?.cors).toBe(false)
  })
})

describe('buildBootstrapScript', () => {
  it('origin を含む絶対 URL で @vite/client と実エントリを注入する', () => {
    const script = buildBootstrapScript('https://localhost:59000', 'src/apps/foo.ts')
    expect(script).toContain('https://localhost:59000/@vite/client')
    expect(script).toContain('https://localhost:59000/src/apps/foo.ts')
    expect(script).toContain('module')
  })
})
