import { describe, it, expect } from 'vitest'
import { GoqooError } from '../src/types'

describe('GoqooError', () => {
  it('message/appId/recordId を保持する', () => {
    const e = new GoqooError('boom', 12, 345)
    expect(e).toBeInstanceOf(Error)
    expect(e.message).toBe('boom')
    expect(e.appId).toBe(12)
    expect(e.recordId).toBe(345)
  })
})
