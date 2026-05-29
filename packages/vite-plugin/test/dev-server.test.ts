import { describe, it, expect } from 'vitest'
import { applyServerDefaults, buildReloadSnippet, RELOAD_PATH } from '../src/dev-server'

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

describe('buildReloadSnippet', () => {
  it('currentScript の origin 基準で SSE に接続し reload する', () => {
    const snippet = buildReloadSnippet()
    expect(snippet).toContain('EventSource')
    expect(snippet).toContain(RELOAD_PATH)
    expect(snippet).toContain('document.currentScript')
    expect(snippet).toContain('location.reload()')
  })
})
