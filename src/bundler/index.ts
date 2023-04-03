import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { usageExit, currentPath, projectPath, loadGoqooConfig } from '../_common/util'

const main = async (argv: any): Promise<void> => {
  const { bundlerType, nodeEnv = 'development' } = loadGoqooConfig()
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = nodeEnv
  }
  console.info({ bundlerType, nodeEnv: process.env.NODE_ENV })

  const webpackBinPath = currentPath('../../node_modules/.bin/webpack')
  let webpackDefaultConfigPath
  switch (bundlerType) {
    case 'react':
      webpackDefaultConfigPath = currentPath('./webpack.config.react.js')
      break
    case 'vue':
      webpackDefaultConfigPath = currentPath('./webpack.config.vue.js')
      break
    case 'default':
    default:
      webpackDefaultConfigPath = currentPath('./webpack.config.js')
  }
  const webpackCustomConfigPath = projectPath('./webpack.config.js')
  const webpackConfigPath = existsSync(webpackCustomConfigPath) ? webpackCustomConfigPath : webpackDefaultConfigPath

  const options = argv._options.join(' ')
  const webpackCommandBase = `'${webpackBinPath}' ${options} --progress --config '${webpackConfigPath}'`

  const exec = (command: string) => execSync(command, { stdio: 'inherit' })

  switch (argv._subCommand) {
    case 'build': {
      exec(`${webpackCommandBase} --mode development`)
      break
    }
    case 'watch': {
      exec(`${webpackCommandBase} --mode development --watch`)
      break
    }
    case 'release': {
      exec(`${webpackCommandBase} --mode production`)
      break
    }
    case 'start':
    case 's': {
      const port = process.env.GOQOO_PORT ?? argv.port
      exec(
        `'${webpackBinPath}' serve ${options} --port ${port} --progress --config '${webpackConfigPath}' --mode development`
      )
      break
    }
    default: {
      usageExit(1)
    }
  }
}

export default async (argv: any): Promise<void> => {
  try {
    await main(argv)
  } catch (e) {
    console.error(e)
  }
}
