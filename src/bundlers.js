'use strict'

const { execSync } = require('child_process')
const { existsSync } = require('fs')
const { usageExit, currentPath, projectPath } = require('./util')

const execPath = currentPath('../node_modules/.bin/webpack')
const customConfigPath = projectPath('./webpack.config.js')
const configPath = existsSync(customConfigPath) ? customConfigPath : currentPath('./webpack.config.js')

module.exports = (argv) => {
  switch (argv._subCommand) {
    case 'build': {
      const command = `'${execPath}' ${argv._options.join(' ')} --mode development --config '${configPath}'`
      execSync(command, { stdio: 'inherit' })
      break
    }

    case 'dev':
    case 'serve':
    case 's': {
      const command = `'${execPath}' serve ${argv._options.join(' ')} --mode development --config '${configPath}'`
      execSync(command, { stdio: 'inherit' })
      break
    }

    default: {
      usageExit(1)
    }
  }
}
