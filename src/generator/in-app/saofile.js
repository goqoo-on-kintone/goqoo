// @ts-check

const Mustache = require('mustache')

/**
 * @type { import('sao').GeneratorConfig['prompts'] }
 */
const prompts = function prompts() {
  return [
    {
      type: 'input',
      name: 'name',
      // @ts-expect-error
      message: this.opts.answers.generatorName + ' name',
      // @ts-expect-error
      default: this.opts.answers.generatorName,
    },
    {
      type: 'input',
      name: 'appName',
      message: 'App name',
    },
    {
      type: 'list',
      name: 'fieldCodes',
      message: 'Field codes (comma-separated)',
    },
  ]
}

/**
 * @type { import('sao').GeneratorConfig['actions'] }
 */
const actions = function () {
  const extensions = [
    'ts',
    'js',
    'tsx',
    'jsx',
    'html',
    'css',
    'scss',
    'png',
    'jpg',
    'gif',
    'svg',
    'eot',
    'ttf',
    'woff',
    'woff2',
  ]
  return [
    {
      type: 'add',
      files: '**',
      // @ts-expect-error
      templateDir: this.opts.answers.templateDir,
    },
    {
      type: 'modify',
      files: '**/[_name_].ts',
      handler: (before) => {
        const after1 = Mustache.render(
          before,
          {
            name: this.answers.name,
          },
          {},
          ['[_', '_]']
        )
        const after2 = Mustache.render(
          after1,
          {
            fieldCodes: JSON.stringify(this.answers.fieldCodes),
          },
          {},
          ['/*%', '%*/']
        )
        return after2
      },
    },
    {
      type: 'move',
      patterns: Object.fromEntries(extensions.map((ext) => [`[_name_].${ext}`, `${this.answers.name}.${ext}`])),
    },
    {
      type: 'modify',
      files: ['index.ts', 'index.js'],
      handler: (data) => {
        return `${data}
import './${this.answers.name}'
`
      },
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
