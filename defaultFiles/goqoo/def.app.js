kintone.events.on('app.record.index.show', event => {
  console.log(event)
  window.alert('hello, Goqoo on kintone!')
  return event
})
