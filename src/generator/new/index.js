// @ts-check
'use strict'

const { SAO, handleError } = require('sao')
const { resolve } = require('path')
const { existsDirectory } = require('../../util')

module.exports = ({ templateDirRoot, projectDir }) => {
  // TODO: templateDirをユーザーが指定可能に
  const templateDir = templateDirRoot
  if (!existsDirectory(templateDir)) {
    console.error(`Template not found: ${templateDir}`)
    process.exit(1)
  }

  const sao = new SAO({
    generator: resolve(__dirname, './'),
    outDir: projectDir,
    answers: { templateDir },
  })
  sao.run().catch(handleError)
}
