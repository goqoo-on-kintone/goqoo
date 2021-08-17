// @ts-check

const { join } = require('path')

/**
 * @type { import('sao').GeneratorConfig['prompts'] }
 */
const prompts = function prompts() {
  return [
    {
      type: 'input',
      name: 'name',
      message: 'Project name',
      default: this.outDirName,
    },
    {
      type: 'input',
      name: 'description',
      message: 'Project description',
    },
    {
      type: 'select',
      name: 'frontendFramework',
      message: 'Frontend Framework',
      choices: ['(None)', 'React', 'Vue'],
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
      filters: {
        'src/apps/**': false,
        'src/in-app/**': false,
        'dist/**': false,
        'node_modules/**': false,
      },
      templateDir: join(
        // @ts-expect-error
        this.opts.answers.templateDir,
        this.answers.frontendFramework === '(None)' ? 'default' : this.answers.frontendFramework.toLowerCase()
      ),
    },
    {
      type: 'modify',
      files: 'package.json',
      handler: (data) => ({
        ...data,
        name: this.answers.name.toLowerCase(),
        description: this.answers.description,
      }),
    },
  ]
}

/**
 * @type { import('sao').GeneratorConfig }
 */
module.exports = {
  prompts,
  actions,
  async completed() {
    this.gitInit()
    await this.npmInstall()
    this.showProjectTips()
  },
}
