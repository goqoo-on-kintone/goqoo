import { intro, outro, text, confirm, isCancel, cancel, log } from '@clack/prompts'
import { resolve, basename } from 'node:path'
import { existsSync } from 'node:fs'
import { scaffold } from './scaffold'
import type { Answers } from './types'

const main = async () => {
  intro('create-goqoo')

  const targetArg = process.argv[2]
  const targetDir = resolve(process.cwd(), targetArg ?? '.')

  const name = await text({
    message: 'Project name',
    initialValue: targetArg ? basename(targetDir) : '',
    validate: (v) => (v.length === 0 ? '必須です' : undefined),
  })
  if (isCancel(name)) return cancel('中止しました')

  const description = await text({ message: 'Description', initialValue: '' })
  if (isCancel(description)) return cancel('中止しました')

  const ginue = await confirm({ message: 'ginue を使いますか？', initialValue: false })
  if (isCancel(ginue)) return cancel('中止しました')
  const gyuma = await confirm({ message: 'gyuma を使いますか？', initialValue: false })
  if (isCancel(gyuma)) return cancel('中止しました')
  const trunks = await confirm({ message: 'trunks を使いますか？', initialValue: false })
  if (isCancel(trunks)) return cancel('中止しました')

  if (existsSync(targetDir) && targetArg && targetArg !== '.') {
    log.warn(`${targetDir} は既に存在します。中身を上書きする可能性があります。`)
  }

  const answers: Answers = {
    name: String(name),
    description: String(description),
    ginue: Boolean(ginue),
    gyuma: Boolean(gyuma),
    trunks: Boolean(trunks),
  }

  scaffold(answers, targetDir)

  outro(`完成しました！\n  cd ${targetArg ?? '.'}\n  pnpm install\n  pnpm dev`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
