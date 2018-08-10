const fs = require('fs-extra')
const yaml = require('js-yaml')
const { trim, readFilePromise } = require('./goqoo')

const appJs = readFilePromise('app.js', 'generator')
const scaffoldJs = readFilePromise('scaffold.js', 'generator')
const scaffoldIndexJs = readFilePromise('scaffold-index.js', 'generator')
const scaffoldDetailJs = readFilePromise('scaffold-detail.js', 'generator')
const scaffoldSubmitJs = readFilePromise('scaffold-submit.js', 'generator')

const usageExit = (returnCode = 0) => {
  const message = trim(`
usage: goqoo generate [options] <GENERATOR> <app name>

-h, --help                    output usage information

Please choose a generator below.
  app
  scaffold
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

const isExistingDir = file => fs.existsSync(file) && fs.statSync(file).isDirectory()

const validateProject = () => {
  // TODO: もう少し本質的なチェックを考える。何を以って「Goqooプロジェクト」とみなすか？
  if (!isExistingDir('.goqoo')) {
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
    fs.mkdirpSync(targetDir)
    switch (opts.generator) {
      // TODO: すでにファイルが存在したらどうするか聞くようにしたい(app, scaffold)
      case 'app':
        const targetFile = `${targetDir}/${opts.target}.js`
        fs.writeFileSync(targetFile, await appJs)
        console.log(`${targetFile}: created!`)
        break
      case 'scaffold':
        const appFile = `${targetDir}/${opts.target}.js`
        fs.writeFileSync(appFile, (await scaffoldJs).replace(/%APP%/g, opts.target))
        console.log(`${appFile}: created!`)

        const indexFile = `${targetDir}/${opts.target}-index.js`
        fs.writeFileSync(indexFile, await scaffoldIndexJs)
        console.log(`${indexFile}: created!`)

        const detailFile = `${targetDir}/${opts.target}-detail.js`
        fs.writeFileSync(detailFile, await scaffoldDetailJs)
        console.log(`${detailFile}: created!`)

        const submitFile = `${targetDir}/${opts.target}-submit.js`
        fs.writeFileSync(submitFile, await scaffoldSubmitJs)
        console.log(`${submitFile}: created!`)

        break
    }
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  goqooGenerate,
}
