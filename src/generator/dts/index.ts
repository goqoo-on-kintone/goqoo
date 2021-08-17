import { spawn } from 'child_process'
import { mkdirSync } from 'fs'
import chalk from 'chalk'
import { paramCase as kebabCase, pascalCase } from 'change-case'
// @ts-ignore
import { projectPath } from '../../util'
import type { Config } from '../../types/goqoo.types'

type Runner = (config: Config) => void

export const run: Runner = (config) => {
  const { dtsGen } = config
  const context = config.environments.find((c) => c.env === dtsGen?.env)
  if (!context) {
    throw new Error('dts-gen context not found!')
  }

  const distDir = 'dts'
  mkdirSync(distDir, { recursive: true })

  const connection = {
    'base-url': `https://${context.domain}`,
    // TODO: 別の入力方法にも対応
    'username': process.env.GOQOO_USERNAME,
    'password': process.env.GOQOO_PASSWORD,
    'basic-auth-username': process.env.GOQOO_BASICAUTH_USERNAME,
    'basic-auth-password': process.env.GOQOO_BASICAUTH_PASSWORD,
  }
  const skipApps = dtsGen?.skip || []
  Object.entries(context.appId).forEach(([appName, appId]) => {
    if (skipApps.includes(appName)) {
      return
    }

    const args = {
      ...connection,
      'type-name': `${pascalCase(appName)}Fields`,
      'app-id': appId,
      'output': `${distDir}/${kebabCase(appName)}-fields.d.ts`,
    }

    const process = spawn(
      'npx',
      ['kintone-dts-gen', ...Object.entries(args).map(([key, value]) => `--${key}=${value}`)],
      {
        cwd: projectPath('./'),
        stdio: 'inherit',
      }
    )

    // 終了時の処理
    process.on('close', (code) => {
      if (code !== 0) {
        // TODO: kintoneへのリクエストに失敗してもdts-genは0を返すのでどうしたものか…
        console.error(`kintone-dts-gen process exited with code ${code}`)
      }
      console.info(`${chalk.cyan('info')} ${chalk.magenta('Created')} ${chalk.green(args.output)}`)
    })
  })
}
