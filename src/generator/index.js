// @ts-check
'use strict'

const { dirname, join } = require('path')
const { existsSync } = require('fs')
const { projectPath } = require('../util')

module.exports = (argv) => {
  const rawArgv = process.argv.slice(3)
  const templateDirRoot = join(dirname(require.resolve('@goqoo/templates/package.json')), 'templates')

  if (argv._subCommand === 'new') {
    const [projectDir] = rawArgv
    return require('./new')({ templateDirRoot, projectDir })
  }

  const [generatorName, appName] = rawArgv
  if (!generatorName || !appName) {
    // TODO: ちゃんと関数化などする
    console.error(`usage: goqoo generate GENERATOR APP`)
    process.exit(1)
  }

  const goqooConfigPath = projectPath('./goqoo.config.js')
  const goqooConfig = existsSync(goqooConfigPath) ? require(goqooConfigPath) : {}

  switch (generatorName) {
    case 'dts':
      // TODO: @kintone/dts-genのラッパーを実装
      return require('./dts')({})

    case 'scaffold':
      // TODO: appとin-appの組み合わせ全部入り
      return require('./scaffold')({})

    case 'app':
    case 'space':
    case 'portal':
      return require('./app')({ templateDirRoot, goqooConfig, generatorName, appName })

    default:
      // event, customize-viewなど、既存アプリ内にgenerateするもの
      return require('./in-app')({ templateDirRoot, goqooConfig, generatorName, appName })
  }
}
