import { describe, it, expect, afterEach } from 'vitest'
import { getQueryOrder } from '../src/tools'

const setKintone = (query: string) => {
  // @ts-expect-error test global
  globalThis.kintone = { app: { getQuery: () => query } }
}
afterEach(() => {
  // @ts-expect-error cleanup
  delete globalThis.kintone
})

describe('getQueryOrder', () => {
  it('order by 句を抽出する', () => {
    setKintone('foo = "x" order by 日時 desc limit 100 offset 0')
    expect(getQueryOrder()).toBe('日時 desc')
  })
  it('order by が無ければ空文字', () => {
    setKintone('limit 20')
    expect(getQueryOrder()).toBe('')
  })
})
