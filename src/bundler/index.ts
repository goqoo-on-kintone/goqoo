import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { usageExit, currentPath, projectPath, loadGoqooConfig } from '../util'

const main = async (argv: any): Promise<void> => {
  const goqooConfig = await loadGoqooConfig()

  const webpackBinPath = currentPath('../../node_modules/.bin/webpack')
  let webpackDefaultConfigPath
  switch (goqooConfig.bundlerType) {
    case 'react':
      webpackDefaultConfigPath = currentPath('./webpack.config.react.js')
      break
    case 'vue':
      webpackDefaultConfigPath = currentPath('./webpack.config.vue.js')
      break
    case 'standard':
    default:
      webpackDefaultConfigPath = currentPath('./webpack.config.js')
  }
  const webpackCustomConfigPath = projectPath('./webpack.config.js')
  const webpackConfigPath = existsSync(webpackCustomConfigPath) ? webpackCustomConfigPath : webpackDefaultConfigPath

  switch (argv._subCommand) {
    case 'build': {
      const command = `'${webpackBinPath}' ${argv._options.join(
        ' '
      )} --mode development --config '${webpackConfigPath}'`
      execSync(command, { stdio: 'inherit' })
      break
    }

    case 'dev':
    case 'serve':
    case 's': {
      const command = `'${webpackBinPath}' serve ${argv._options.join(
        ' '
      )} --mode development --config '${webpackConfigPath}'`
      execSync(command, { stdio: 'inherit' })
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
