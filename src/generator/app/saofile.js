// @ts-check
const { dirname, join } = require('path')

const templateDirRoot = join(dirname(require.resolve('@goqoo/templates/package.json')), 'templates')

/**
 * @type { import('sao').GeneratorConfig['prompts'] }
 */
const prompts = function prompts() {
  return [
    {
      type: 'input',
      name: 'name',
      message: 'App name',
    },
  ]
}

/**
 * @type { import('sao').GeneratorConfig['actions'] }
 */
const actions = function () {
  return [
    {
      type: 'add',
      files: '**',
      templateDir: join(templateDirRoot, 'app'),
    },
  ]
}

/**
 * @type { import('sao').GeneratorConfig }
 */
module.exports = {
  prompts,
  actions,
}
