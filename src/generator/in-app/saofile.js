// @ts-check

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
      // @ts-expect-error
      templateDir: this.opts.answers.templateDir,
    },
    {
      type: 'move',
      patterns: Object.fromEntries(
        [
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
        ].map((ext) => [
          // @ts-expect-error
          `${this.opts.answers.generatorName}.${ext}`,
          `${this.answers.name}.${ext}`,
        ])
      ),
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
