'use strict'

const { spawnSync } = require('child_process')
const { usageExit } = require('./util')

module.exports = (argv) => {
  switch (argv.subCommand) {
    case 'build': {
      spawnSync('echo', ['run webpack build'], { stdio: 'inherit' })
      break
    }
    case 'dev':
    case 'serve':
    case 's': {
      spawnSync('echo', ['run webpack serve'], { stdio: 'inherit' })
      break
    }
    default: {
      usageExit(1)
    }
  }
}
