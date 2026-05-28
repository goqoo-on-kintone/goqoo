import { describe, it, expect } from 'vitest'
import { mkdtempSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { scaffold } from '../src/scaffold'
import type { Answers } from '../src/types'

function scaffoldTo(answers: Answers) {
  const dir = mkdtempSync(join(tmpdir(), 'create-goqoo-'))
  scaffold(answers, dir)
  return dir
}
const make = (overrides: Partial<Answers> = {}) =>
  scaffoldTo({ name: 'myapp', description: 'd', ginue: false, gyuma: false, trunks: false, ...overrides })

describe('scaffold', () => {
  it('ベーステンプレートと生成物を書き出す', () => {
    const dir = make()
    expect(existsSync(join(dir, 'vite.config.ts'))).toBe(true)
    expect(existsSync(join(dir, 'src/apps/sample.ts'))).toBe(true)
    expect(existsSync(join(dir, 'src/kintone.d.ts'))).toBe(true)
    expect(existsSync(join(dir, 'customize-manifest.json'))).toBe(true)
    expect(existsSync(join(dir, '.gitignore'))).toBe(true)
    expect(existsSync(join(dir, '.env'))).toBe(true)
    expect(existsSync(join(dir, 'CLAUDE.md'))).toBe(true)
    expect(existsSync(join(dir, '_gitignore'))).toBe(false) // renamed away
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
    expect(pkg.name).toBe('myapp')
    expect(pkg.scripts.build).toBe('vite build --mode development')
  })

  it('ginue 選択時は .ginuerc スタブを生成する', () => {
    const dir = make({ ginue: true })
    expect(existsSync(join(dir, '.ginuerc.json'))).toBe(true)
  })

  it('trunks 選択時は trunks.config.js スタブを生成する', () => {
    const dir = make({ trunks: true })
    expect(existsSync(join(dir, 'trunks.config.js'))).toBe(true)
  })
})
