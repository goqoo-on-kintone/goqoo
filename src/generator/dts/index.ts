import { spawnSync } from 'child_process'
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
  const auth = context.auth ?? {}
  auth.type ??= 'password'
  switch (auth.type) {
    case 'apiToken': {
      break
    }
    case 'oauth': {
      connection['oauth-token'] = await getOauthToken({
        domain: context.host,
        scope: auth.scope,
        proxy: auth.proxy,
        pfx: auth.pfx,
      })
      break
    }
    case 'password':
    default: {
      // TODO: netrcや標準入力に対応
      connection['username'] = process.env.GOQOO_USERNAME
      connection['password'] = process.env.GOQOO_PASSWORD
      connection['basic-auth-username'] = process.env.GOQOO_BASICAUTH_USERNAME
      connection['basic-auth-password'] = process.env.GOQOO_BASICAUTH_PASSWORD
      break
    }
  }

  const skipApps = dtsGen?.skip || []
  Object.entries(context.appId).forEach(([appName, appId]) => {
    if (skipApps.includes(appName)) {
      return
    }

    if (auth.type === 'apiToken') {
      connection['api-token'] = process.env[`GOQOO_API_TOKEN_${appName.toUpperCase()}`]
    }

    const args = {
      ...connection,
      'type-name': `${pascalCase(appName)}Fields`,
      'app-id': appId,
      'output': `${distDir}/${kebabCase(appName)}-fields.d.ts`,
    }

    const { status } = spawnSync(
      'npx',
      ['kintone-dts-gen', ...Object.entries(args).map(([key, value]) => `--${key}=${value}`)],
      {
        cwd: projectPath('./'),
        stdio: 'inherit',
      }
    )

    if (status === 0) {
      console.info(`${chalk.cyan('info')} ${chalk.magenta('Created')} ${chalk.green(args.output)}`)
    } else {
      console.info(`${chalk.red('error')} Failed of generating ${chalk.yellow(args.output)} (authType: ${auth.type})`)
    }
  })
}
