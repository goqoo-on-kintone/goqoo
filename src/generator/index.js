'use strict'

const { SAO, handleError } = require('sao')
const path = require('path')
const { usageExit } = require('../util')

const npmClient = 'yarn' // 'yarn' | 'npm' | 'pnpm'

module.exports = (argv) => {
  const rawArgv = process.argv.slice(3)

  switch (argv._subCommand) {
    case 'init': {
      console.log('Under implementation...')
      process.exit()
    }
    case 'new': {
      const projectDir = rawArgv.shift()
      const sao = new SAO({
        generator: path.resolve(__dirname, './'),
        outDir: projectDir,
        npmClient,
      })
      sao.run().catch(handleError)
      break
    }
    case 'generate':
    case 'g': {
      // const subGenerator = `g-${rawArgv.shift()}`
      console.log('Under implementation...')
      process.exit()
    }
    default: {
      usageExit(1)
    }
  }
}
