const fs = require('fs')
const mkdirp = require('mkdirp')
const yaml = require('js-yaml')
const { trim, readFilePromise } = require('./goqoo')

const appJs = readFilePromise('app.js', 'goqoo')

const usageExit = (returnCode = 0) => {
  const message = trim(`
usage: goqoo generate <GENERATOR> [<options>]

-h, --help                    output usage information
`)
  console.error(message)
  process.exit(returnCode)
}

const validateOptions = async opts => {
  if (opts.help) {
    usageExit(0)
  }
  if (!opts.target) {
    usageExit(1)
  }

  if (!['app', 'scaffold'].includes(opts.generator)) {
    usageExit(1)
  }
}

const isExistDir = file => fs.existsSync(file) && fs.statSync(file).isDirectory()

const validateProject = () => {
  // TODO: もう少し本質的なチェックを考える。何を以って「Goqooプロジェクト」とみなすか？
  if (!isExistDir('.goqoo')) {
    console.error('ERROR: Not Goqoo project')
    process.exit(1)
  }
}

const goqooGenerate = async opts => {
  opts.generator = opts.target
  opts.target = opts._[2]
  validateOptions(opts)
  validateProject()

  try {
    // configファイルにアプリ情報を追加
    const goqooConfigPath = 'config/goqoo.config.yml'
    const config = yaml.safeLoad(fs.readFileSync(goqooConfigPath, 'utf8'))
    if (Object.values(config.apps).includes(opts.target)) {
      console.error(`ERROR: '${opts.target}' already exists!`)
      process.exit(1)
    }
    config.apps.push(opts.target)
    const configStr = yaml.safeDump(config)
    fs.writeFileSync(goqooConfigPath, configStr)
    console.log(`${goqooConfigPath}: '${opts.target}' added!`)

    // JSコードを追加
    const targetDir = `apps/${opts.target}`
    mkdirp.sync(targetDir)
    switch (opts.generator) {
      case 'app':
        const targetFile = `${targetDir}/${opts.target}.js`
        fs.writeFileSync(targetFile, await appJs)
        console.log(`${targetFile}: created!`)
        break
      case 'scaffold':
        // TODO: これから実装
        break
    }
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  goqooGenerate,
}
