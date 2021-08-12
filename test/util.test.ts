import { trim } from '../src/util'

describe('util', () => {
  it('trimで先頭・末尾の改行が正しく削られる', () => {
    expect(
      trim(`
usage: goqoo
<options>
`)
    ).toEqual(
      `usage: goqoo
<options>`
    )
  })
})
