import { goqoo } from '@goqoo/lib'

goqoo('sample', () => {
  kintone.events.on('app.record.index.show', (event: any) => {
    console.log('Hello, goqoo!')
    return event
  })
})
