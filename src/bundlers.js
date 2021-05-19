'use strict'

const path = require('path')
const caller = require('caller')
const { execSync } = require('child_process')
const { existsSync } = require('fs')
const { usageExit } = require('./util')

const projectPath = (...args) => path.resolve(...args)

const currentPath = (...args) => {
  const dir = path.dirname(caller())
  return path.resolve(dir, ...args)
}

const execPath = currentPath('../node_modules/.bin/webpack')
const customConfigPath = projectPath('./webpack.config.js')
const configPath = existsSync(customConfigPath) ? customConfigPath : currentPath('./webpack.config.js')

module.exports = (argv) => {
  switch (argv._subCommand) {
    case 'build': {
      const command = `'${execPath}' ${argv._options.join(' ')} --config '${configPath}'`
      execSync(command, { stdio: 'inherit' })
      break
    }

    case 'dev':
    case 'serve':
    case 's': {
      const command = `'${execPath}' serve ${argv._options.join(' ')} --config '${configPath}'`
      execSync(command, { stdio: 'inherit' })
      break
    }

    default: {
      usageExit(1)
    }
  }
}
