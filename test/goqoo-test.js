require('./helper.js')

it('trimで先頭・末尾の改行が正しく削られる', () => {
  const newlineIncludedStr = `
usage: goqoo
<options>
`
  const newlineTrimmedStr = `usage: goqoo
<options>`
  assert.notEqual(goqoo.trim(newlineIncludedStr), newlineIncludedStr)
  assert.equal(goqoo.trim(newlineIncludedStr), newlineTrimmedStr)
})
