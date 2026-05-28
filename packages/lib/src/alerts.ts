import Swal from 'sweetalert2'
import type { SweetAlertOptions, SweetAlertResult } from 'sweetalert2'
import { GoqooError } from './types'
import logo from './assets/logo.jpg'

export const helloGoqoo = (): Promise<SweetAlertResult> =>
  Swal.fire({ text: 'Hello, Goqoo on kintone!', imageUrl: logo, imageWidth: 200 })

export const confirmDialog = (params: string | SweetAlertOptions): Promise<SweetAlertResult> => {
  const custom = typeof params === 'string' ? { text: params } : params
  return Swal.fire({
    icon: 'info',
    showCancelButton: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    ...custom,
  })
}

export const successDialog = (text: string): Promise<SweetAlertResult> =>
  Swal.fire({ icon: 'success', text })

const toMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return (e as { message: string }).message
  }
  return 'エラーが発生しました。'
}

const toDetail = (e: unknown): string => {
  if (e instanceof Error) return JSON.stringify({ message: e.message, stack: e.stack }, null, 2)
  if (typeof e === 'string') return '（エラーの詳細情報はありません）'
  try {
    return JSON.stringify(e, null, 2)
  } catch {
    return String(e)
  }
}

export const errorDialog = async (e: GoqooError | Error | string | unknown): Promise<SweetAlertResult> => {
  const text = toMessage(e)
  const detail = toDetail(e)
  const recordLink =
    e instanceof GoqooError
      ? `<p>該当レコード: <a href="${location.origin}/k/${e.appId}/show#record=${e.recordId}" target="_blank">開く</a></p>`
      : ''

  const result = await Swal.fire({
    icon: 'error',
    title: 'エラー',
    html: `<p>${text}</p>${recordLink}`,
    showCancelButton: true,
    confirmButtonText: '閉じる',
    cancelButtonText: 'エラーの詳細を表示',
  })

  // NOTE: SweetAlert2 の DismissReason.cancel は文字列 'cancel'。Swal をモックしても壊れないよう文字列で比較。
  if (result.dismiss === 'cancel') {
    const detailResult = await Swal.fire({
      input: 'textarea',
      inputValue: `${text}\n\n${detail}`,
      inputAttributes: { readonly: 'true', style: 'height:20rem;' },
      confirmButtonText: 'クリップボードにコピーして閉じる',
    } as SweetAlertOptions)
    if (detailResult.isConfirmed) {
      try {
        await navigator.clipboard.writeText(`${text}\n\n${detail}`)
      } catch {
        /* clipboard 失敗は無視 */
      }
    }
    return detailResult
  }
  return result
}
