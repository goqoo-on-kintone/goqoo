// @ts-check
'use strict'

const { SAO, handleError } = require('sao')
const { resolve, join } = require('path')
const { existsDirectory, projectPath } = require('../../util')

module.exports = ({ templateDirRoot, generatorName, name }) => {
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
    generator: resolve(__dirname, './'),
    outDir: join(appsDir, name),
    answers: { name, templateDir },
  })
  sao.run().catch(handleError)
}
