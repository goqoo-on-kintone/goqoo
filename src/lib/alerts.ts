import swal from 'sweetalert'
import copy from 'clipboard-copy'
import type { SwalParams as SP } from 'sweetalert/typings/core'
import { GoqooError } from '.'
// @ts-expect-error
import logo from '../../img/logo.jpg'
import { KintoneAllRecordsError } from './KintoneRestAPIError'

type SwalResult = null | any
type SwalParams = SP[number]

export const helloGoqoo = async (): Promise<SwalResult> => {
  return swal({
    text: 'Hello, Goqoo on kintone!',
    icon: logo,
  })
}

export const confirmDialog = async (swalParams: SwalParams): Promise<SwalResult> => {
  const customParams = typeof swalParams === 'string' ? { text: swalParams } : swalParams
  return swal({
    icon: 'info',
    buttons: {
      cancel: true,
      confirm: {
        closeModal: false,
      },
    },
    closeOnClickOutside: false,
    closeOnEsc: false,
    ...customParams,
  }).then((result) => {
    const cancelButton = document.querySelector('.swal-button--cancel')
    cancelButton?.parentNode?.removeChild(cancelButton)
    return result
  })
}

export const successDialog = async (text: string): Promise<SwalResult> => {
  return swal({ icon: 'success', text })
}

export const errorDialog = async (e: GoqooError | KintoneAllRecordsError | Error | string): Promise<SwalResult> => {
  // NOTE: 型を無視してError以外のオブジェクトやstring以外のプリミティブ型が渡されても
  // ダイアログは落ちずに正しく表示されるようにしておくため、unknown型から絞り込んでいく
  const error = e as unknown

  let text: string
  if (error instanceof KintoneAllRecordsError) {
    text = error.error.message
  } else if (error instanceof Object && 'message' in error && typeof error.message === 'string') {
    text = error.message
  } else if (typeof error === 'string') {
    text = error
  } else {
    text = 'エラーが発生しました。'
  }

  let errorDetail: string
  if (error instanceof Object) {
    const stack = 'stack' in error ? error.stack : undefined
    errorDetail = JSON.stringify({ ...error, stack }, null, 2)
  } else if (typeof error === 'string') {
    errorDetail = '（エラーの詳細情報はありません）'
  } else {
    errorDetail = String(error)
  }

  const div = document.createElement('div')
  if (error instanceof GoqooError) {
    const url = `${location.origin}/k/${error.appId}/show#record=${error.recordId}`
    div.innerHTML = `
    該当レコード: <a href="${url}" target="_blank">${url}</a>
    `
  }

  const result = await swal({
    icon: 'error',
    text,
    content: { element: div },
    buttons: {
      cancel: {
        visible: true,
        text: 'エラーの詳細を表示',
        value: 'detail',
      },
      confirm: true,
    },
  })
  if (result === 'detail') {
    const detail = text + '\n\n' + errorDetail
    const isCopy = await swal({
      content: {
        element: 'textarea',
        attributes: {
          value: detail,
          readOnly: true,
          style: 'width: 100%; height: 20rem;',
        },
      },
      buttons: {
        confirm: {
          text: 'クリップボードにコピーして閉じる',
        },
      },
    })
    isCopy && copy(detail)
  }
  return result
}
