import { cpSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Answers } from './types'
import { buildPackageJson, buildClaudeMd } from './builders'

const here = dirname(fileURLToPath(import.meta.url))
// src(vitest 実行時) と dist(ビルド後) の双方で ../templates/base が同じ実体を指す
const templateDir = join(here, '../templates/base')

const renameDotfiles = (dir: string) => {
  const pairs: [string, string][] = [
    ['_gitignore', '.gitignore'],
    ['_env', '.env'],
    ['_env.development', '.env.development'],
  ]
  for (const [from, to] of pairs) {
    const src = join(dir, from)
    if (existsSync(src)) renameSync(src, join(dir, to))
  }
}

export const scaffold = (answers: Answers, targetDir: string): void => {
  mkdirSync(targetDir, { recursive: true })
  cpSync(templateDir, targetDir, { recursive: true })
  renameDotfiles(targetDir)

  writeFileSync(join(targetDir, 'package.json'), JSON.stringify(buildPackageJson(answers), null, 2) + '\n')
  writeFileSync(join(targetDir, 'CLAUDE.md'), buildClaudeMd(answers))

  if (answers.ginue) {
    // TODO: ginue の正確な .ginuerc スキーマは要確認。最小スタブを生成。
    const ginuerc = {
      location: '.',
      env: {
        development: { domain: 'example.cybozu.com', username: '', password: '', app: { sample: '1' } },
      },
    }
    writeFileSync(join(targetDir, '.ginuerc.json'), JSON.stringify(ginuerc, null, 2) + '\n')
  }
  if (answers.trunks) {
    // TODO: trunks の正確な設定スキーマは要確認。最小スタブを生成。
    writeFileSync(
      join(targetDir, 'trunks.config.js'),
      '// TODO: trunks の設定。詳細は trunks のドキュメントを参照。\nexport default {}\n'
    )
  }
}
