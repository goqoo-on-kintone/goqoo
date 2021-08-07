// @ts-check
'use strict'

const { dirname, join } = require('path')
const { usageExit } = require('../util')
const _new = require('./new')
const app = require('./app')

const templateDirRoot = join(dirname(require.resolve('@goqoo/templates/package.json')), 'templates', '_new')

module.exports = (argv) => {
  const rawArgv = process.argv.slice(3)

  if (argv._subCommand === 'new') {
    const [projectDir] = rawArgv
    return _new({ templateDirRoot, projectDir })
  }

  const [generatorName, name] = rawArgv
  if (!generatorName || !name) {
    // TODO: ちゃんと関数化などする
    console.error(`usage: goqoo generate <generator> <name>`)
    process.exit(1)
  }

  if (generatorName === 'app') {
    return app({ templateDirRoot, generatorName, name })
  }

  usageExit(1)
}
