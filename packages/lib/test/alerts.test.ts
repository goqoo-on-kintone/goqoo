import { describe, it, expect, vi, beforeEach } from 'vitest'

const fire = vi.fn()
vi.mock('sweetalert2', () => ({ default: { fire: (...a: unknown[]) => fire(...a) } }))

import { confirmDialog, successDialog, errorDialog, helloGoqoo } from '../src/alerts'
import { GoqooError } from '../src/types'

beforeEach(() => fire.mockReset())

describe('alerts', () => {
  it('confirmDialog は confirm/cancel・外側Esc無効で fire する', async () => {
    fire.mockResolvedValue({ isConfirmed: true })
    await confirmDialog('OK?')
    const arg = fire.mock.calls[0][0]
    expect(arg.showCancelButton).toBe(true)
    expect(arg.allowOutsideClick).toBe(false)
    expect(arg.allowEscapeKey).toBe(false)
    expect(arg.text).toBe('OK?')
  })

  it('successDialog は success アイコンで fire する', async () => {
    fire.mockResolvedValue({ isConfirmed: true })
    await successDialog('done')
    expect(fire.mock.calls[0][0]).toMatchObject({ icon: 'success', text: 'done' })
  })

  it('errorDialog は error アイコンで、GoqooError ならレコードリンクを含む', async () => {
    fire.mockResolvedValue({ isConfirmed: true })
    await errorDialog(new GoqooError('失敗', 5, 99))
    const arg = fire.mock.calls[0][0]
    expect(arg.icon).toBe('error')
    expect(String(arg.html ?? '') + String(arg.text ?? '')).toContain('失敗')
    expect(String(arg.html ?? '')).toContain('/k/5/show#record=99')
  })

  it('helloGoqoo は fire する', async () => {
    fire.mockResolvedValue({ isConfirmed: true })
    await helloGoqoo()
    expect(fire).toHaveBeenCalled()
  })
})
