kintone.events.on('app.record.detail.show', event => {
  console.log('detail', event)
  return event
})
