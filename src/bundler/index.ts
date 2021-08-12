import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { usageExit, currentPath, projectPath } from '../util'

const goqooConfigPath = projectPath('./goqoo.config.js')
const goqooConfig = existsSync(goqooConfigPath) ? require(goqooConfigPath) : {}

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

export default (argv: any): void => {
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
