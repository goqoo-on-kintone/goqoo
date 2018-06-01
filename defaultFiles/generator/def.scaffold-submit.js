kintone.events.on(['app.record.create.submit', 'app.record.edit.submit', 'app.record.index.edit.submit'], event => {
  console.log('submit', event)
  if (!window.confirm('Are you sure?')) {
    return false
  }
  return event
})
