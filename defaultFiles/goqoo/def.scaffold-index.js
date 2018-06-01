kintone.events.on('app.record.index.show', event => {
  console.log('index', event)
  return event
})
