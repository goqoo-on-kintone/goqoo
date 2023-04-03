import { spawn } from 'child_process'
import { mkdirSync } from 'fs'
import chalk from 'chalk'
import { paramCase as kebabCase, pascalCase } from 'change-case'
import dotenv from 'dotenv'
// @ts-ignore
import { projectPath } from '../../_common/util'
import { getOauthToken } from '../../_common/oauth'
import type { Config } from '../../lib'

type Runner = (config: Config) => void

export const run: Runner = async (config) => {
  const { dtsGen } = config
  const envName = dtsGen?.env
  const context = config.environments.find((c) => c.env === envName)
  if (!context) {
    throw new Error('dts-gen context not found!')
  }

  dotenv.config({ path: projectPath(`.env.${envName}`) })

  const distDir = 'dts'
  mkdirSync(distDir, { recursive: true })

  const connection: Record<string, string | undefined> = { 'base-url': `https://${context.host}` }
  if (context.oauth) {
    connection['oauth-token'] = await getOauthToken({
      domain: context.host,
      scope: typeof context.oauth === 'object' ? context.oauth.scope : undefined,
      proxy: context.proxy,
      pfx: context.pfx,
    })
  } else {
    connection['username'] = process.env.GOQOO_USERNAME
    connection['password'] = process.env.GOQOO_PASSWORD
    connection['basic-auth-username'] = process.env.GOQOO_BASICAUTH_USERNAME
    connection['basic-auth-password'] = process.env.GOQOO_BASICAUTH_PASSWORD
  }

  const skipApps = dtsGen?.skip || []
  Object.entries(context.appId).forEach(([appName, appId]) => {
    if (skipApps.includes(appName)) {
      return
    }

    const args = {
      // TODO: APIトークンにも対応（ここでconnectionを書き換え）
      ...connection,
      'type-name': `${pascalCase(appName)}Fields`,
      'app-id': appId,
      'output': `${distDir}/${kebabCase(appName)}-fields.d.ts`,
    }

    const childProcess = spawn(
      'npx',
      ['kintone-dts-gen', ...Object.entries(args).map(([key, value]) => `--${key}=${value}`)],
      {
        cwd: projectPath('./'),
        stdio: 'inherit',
      }
    )

    // 終了時の処理
    childProcess.on('close', (code) => {
      if (code !== 0) {
        // TODO: kintoneへのリクエストに失敗してもdts-genは0を返すのでどうしたものか…
        console.error(`kintone-dts-gen process exited with code ${code}`)
        return
      }
      console.info(`${chalk.cyan('info')} ${chalk.magenta('Created')} ${chalk.green(args.output)}`)
    })
  })
}
