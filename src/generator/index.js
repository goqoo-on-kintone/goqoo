'use strict'

const { SAO, handleError } = require('sao')
const path = require('path')
const { usageExit, projectPath } = require('../util')

const npmClient = 'yarn' // 'yarn' | 'npm' | 'pnpm'

module.exports = (argv) => {
  const rawArgv = process.argv.slice(3)

  switch (argv._subCommand) {
    case 'init': {
      console.log('Under implementation...')
      process.exit()
    }
    case 'new': {
      const projectDir = rawArgv[0]
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
      const projectDir = projectPath('./src/apps')
      const name = rawArgv[0]
      if (!name) {
        // TODO: ちゃんと関数化などする
        console.error(`usage: goqoo generate <generator> <name>`)
        process.exit(1)
      }

      const outDir = path.join(projectDir, name || '')
      const sao = new SAO({
        generator: path.resolve(__dirname, './app'),
        outDir,
        npmClient,
        answers: { name },
      })
      sao.run().catch(handleError)
      break
    }
    default: {
      usageExit(1)
    }
  }
}
