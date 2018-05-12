require('./helper.js')

it('trimで先頭・末尾の改行が正しく削られる', () => {
  const newlineIncludedStr = `
usage: ginue
<options>
`
  const newlineTrimmedStr = `usage: ginue
<options>`
  assert.notEqual(ginue.trim(newlineIncludedStr), newlineIncludedStr)
  assert.equal(ginue.trim(newlineIncludedStr), newlineTrimmedStr)
})
