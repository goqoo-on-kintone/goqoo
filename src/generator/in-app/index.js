// @ts-check
'use strict'

const { SAO, handleError } = require('sao')
const { resolve, join } = require('path')
const { existsDirectory, projectPath } = require('../../util')

module.exports = ({ templateDirRoot, goqooConfig, generatorName, appName }) => {
  const appDir = projectPath(`./src/apps/${appName}`)
  if (!existsDirectory(appDir)) {
    console.error(`Not a directory: ${appDir}`)
    process.exit(1)
  }

  // TODO: templateDirをユーザーが指定可能に
  console.log(goqooConfig)
  const bundlerType = goqooConfig.bundlerType || 'standard'
  const templateDir = join(templateDirRoot, bundlerType, 'src/in-app', generatorName)
  if (!existsDirectory(templateDir)) {
    console.error(`Template not found: ${templateDir}`)
    process.exit(1)
  }

  const sao = new SAO({
    generator: resolve(__dirname, './'),
    outDir: join(appDir),
    answers: { generatorName, appName, templateDir },
  })
  sao.run().catch(handleError)
}
