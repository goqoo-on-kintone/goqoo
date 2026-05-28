import { goqoo } from '@goqoo/lib'

goqoo('sample', () => {
  kintone.events.on('app.record.index.show', (event) => {
    console.log('Hello, goqoo!')
    return event
  })
})
