// @ts-check
'use strict'

const { dirname, join } = require('path')
const { usageExit } = require('../util')

const templateDirRoot = join(dirname(require.resolve('@goqoo/templates/package.json')), 'templates', '_new')

module.exports = (argv) => {
  const rawArgv = process.argv.slice(3)

  if (argv._subCommand === 'new') {
    const [projectDir] = rawArgv
    return require('./new')({ templateDirRoot, projectDir })
  }

  const [generatorName, name] = rawArgv
  if (!generatorName || !name) {
    // TODO: ちゃんと関数化などする
    console.error(`usage: goqoo generate <generator> <name>`)
    process.exit(1)
  }

  if (generatorName === 'app') {
    return require('./app')({ templateDirRoot, generatorName, name })
  }

  if (generatorName === 'dts') {
    // TODO: @kintone/dts-genのラッパーを実装
    return require('./dts')({})
  }

  usageExit(1)
}
