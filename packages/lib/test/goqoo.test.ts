import { describe, it, expect, vi, beforeEach } from 'vitest'
import { goqoo } from '../src/goqoo'

beforeEach(() => {
  // @ts-expect-error reset
  window.__goqoo__ = undefined
})

describe('goqoo', () => {
  it('初回は callback を実行し、フラグを立てる', () => {
    const cb = vi.fn()
    goqoo('foo', cb)
    expect(cb).toHaveBeenCalledTimes(1)
    expect(window.__goqoo__.foo).toBe(true)
  })

  it('2回目以降はスキップして警告する', () => {
    const cb = vi.fn()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    goqoo('foo', cb)
    goqoo('foo', cb)
    expect(cb).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
