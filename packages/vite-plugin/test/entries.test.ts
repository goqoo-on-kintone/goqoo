import { describe, it, expect } from 'vitest'
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { discoverEntries } from '../src/entries'

describe('discoverEntries', () => {
  it('appsDir 内のファイルをエントリ名→絶対パスで返し、dotfile を除外する', () => {
    const root = mkdtempSync(join(tmpdir(), 'goqoo-'))
    const appsDir = join(root, 'src/apps')
    mkdirSync(appsDir, { recursive: true })
    writeFileSync(join(appsDir, 'foo.ts'), '')
    writeFileSync(join(appsDir, 'bar.ts'), '')
    writeFileSync(join(appsDir, '.keep'), '')

    const entries = discoverEntries(appsDir)

    expect(entries).toEqual({
      bar: join(appsDir, 'bar.ts'),
      foo: join(appsDir, 'foo.ts'),
    })
  })
})
