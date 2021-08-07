'use strict'

const { SAO, handleError } = require('sao')
const { dirname, join, resolve } = require('path')
const fs = require('fs')
const { usageExit, projectPath } = require('../util')

const templateDirRoot = join(dirname(require.resolve('@goqoo/templates/package.json')), 'templates', '_new')

const existsDirectory = (directory) => {
  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
    return false
  }
  return true
}

module.exports = (argv) => {
  const rawArgv = process.argv.slice(3)

  // TODO: オプションで指定可能にする
  const npmClient = undefined // 'yarn' | 'npm' | 'pnpm'

  switch (argv._subCommand) {
    case 'new': {
      // TODO: templateDirをユーザーが指定可能に
      const templateDir = templateDirRoot
      if (!existsDirectory(templateDir)) {
        console.error(`Template not found: ${templateDir}`)
        process.exit(1)
      }

      const sao = new SAO({
        generator: resolve(__dirname, './'),
        outDir: rawArgv[0],
        npmClient,
        answers: { templateDir },
      })
      sao.run().catch(handleError)
      break
    }

    case 'generate':
    case 'g': {
      const [generatorName, name] = rawArgv
      if (!generatorName || !name) {
        // TODO: ちゃんと関数化などする
        console.error(`usage: goqoo generate <generator> <name>`)
        process.exit(1)
      }

      const appsDir = projectPath('./src/apps')
      if (!existsDirectory(appsDir)) {
        console.error(`Not a directory: ${appsDir}`)
        process.exit(1)
      }

      // TODO: templateDirをユーザーが指定可能に
      const templateDir = join(templateDirRoot, 'src/apps', generatorName)
      if (!existsDirectory(templateDir)) {
        console.error(`Template not found: ${templateDir}`)
        process.exit(1)
      }

      const sao = new SAO({
        generator: resolve(__dirname, './subGenerator'),
        outDir: join(appsDir, name),
        answers: { name, templateDir },
      })
      sao.run().catch(handleError)
      break
    }

    default: {
      usageExit(1)
    }
  }
}
