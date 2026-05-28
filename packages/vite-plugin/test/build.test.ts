import { describe, it, expect, beforeAll } from 'vitest'
import { build } from 'vite'
import { readFileSync, existsSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { goqoo } from '../src/index'

const here = dirname(fileURLToPath(import.meta.url))
const fixture = join(here, 'fixtures/basic')
const dist = join(fixture, 'dist')

describe('goqoo() build orchestration', () => {
  beforeAll(async () => {
    if (existsSync(dist)) rmSync(dist, { recursive: true, force: true })
    await build({
      root: fixture,
      configFile: false,
      logLevel: 'silent',
      plugins: [goqoo({ appsDir: 'src/apps' })],
    })
  })

  it('各エントリが dist/<name>.js として出力される', () => {
    expect(existsSync(join(dist, 'foo.js'))).toBe(true)
    expect(existsSync(join(dist, 'bar.js'))).toBe(true)
  })

  it('各出力は共有チャンクを import しない自己完結ファイル', () => {
    const foo = readFileSync(join(dist, 'foo.js'), 'utf8')
    expect(foo).not.toMatch(/^\s*import\s/m)
    expect(foo).not.toMatch(/from\s+["']\.\//m)
  })

  it('出力に window.__devinfo__[entryName] への代入が含まれる', () => {
    const foo = readFileSync(join(dist, 'foo.js'), 'utf8')
    expect(foo).toContain('window.__devinfo__')
    // minify 後はキーが .foo= 形式になるため、エントリ名が存在することを確認
    expect(foo).toMatch(/window\.__devinfo__.*\.foo\s*=/)
  })
})
