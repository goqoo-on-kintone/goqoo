import swal from 'sweetalert'
import copy from 'clipboard-copy'
import type { SwalParams as SP } from 'sweetalert/typings/core'
import { GoqooError } from '.'
// @ts-expect-error
import logo from '../../img/logo.jpg'

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

export const errorDialog = async (error: GoqooError | Error | string): Promise<SwalResult> => {
  const text = error instanceof Error ? error.message : error || 'エラーが発生しました。'
  const errorJson =
    error instanceof Error
      ? JSON.stringify({ ...error, stack: error.stack }, null, ' ')
      : '（エラーの詳細情報はありません）'

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
    const detail = text + '\n\n' + errorJson
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
