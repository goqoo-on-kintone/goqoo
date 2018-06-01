const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const mkdirp = require('mkdirp')
const { spawn } = require('child_process')

const { prettyln, trim } = require('./goqoo')

const createDefaultFilePath = (fileName, dirName = '') =>
  path.join(__dirname, '../defaultFiles', dirName, `def.${fileName}`)
const createPackageJson = require(createDefaultFilePath('package-json'))
const readFilePromise = (fileName, dirName) => promisify(fs.readFile)(createDefaultFilePath(fileName, dirName), 'utf-8')
const gitignore = readFilePromise('gitignore.txt')
const eslintrc = readFilePromise('eslintrc.yml')
const prettierrc = readFilePromise('prettierrc.yml')
const webpackConfig = readFilePromise('webpack.config.js')
const goqooConfig = readFilePromise('goqoo.config.yml', 'config')
const sampleEnv = readFilePromise('sample.env', 'config')
const dropbox = readFilePromise('dropbox.js', 'goqoo')

const usageExit = (returnCode = 0) => {
  const message = trim(`
usage: goqoo new [options] <project name>

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
}

const goqooNew = async opts => {
  validateOptions(opts)
  const projectName = opts.target

  // プロジェクトディレクトリ作成
  const dirPath = path.resolve(projectName)
  mkdirp.sync(dirPath)
  console.log(dirPath)

  // Git初期化
  fs.writeFileSync(path.join(projectName, '.gitignore'), await gitignore)
  console.log('.gitignore: created!')
  const gitInit = spawn('git', ['init'], { cwd: dirPath, stdio: 'inherit' })
  gitInit.on('close', code => {
    if (code !== 0) {
      console.error(`git process exited with code ${code}`)
    }
  })

  // npm初期化、パッケージインストール
  const packageJson = createPackageJson(projectName)
  const packageJsonPath = path.resolve(path.join(projectName, 'package.json'))
  fs.writeFileSync(packageJsonPath, prettyln(packageJson))
  console.log('package.json: created!')
  const yarnInstall = spawn('yarn', ['install'], { cwd: dirPath, stdio: 'inherit' })
  yarnInstall.on('close', code => {
    if (code !== 0) {
      console.error(`yarn process exited with code ${code}`)
    }
  })

  // webpack初期設定
  const webpackConfigJsPath = path.resolve(path.join(projectName, 'webpack.config.js'))
  fs.writeFileSync(webpackConfigJsPath, await webpackConfig)
  console.log('webpack.config.js: created!')

  // apps dir
  const appsDir = path.join(projectName, 'apps')
  mkdirp.sync(appsDir)
  const appsKeepPath = path.resolve(appsDir, '.gitkeep')
  fs.writeFileSync(appsKeepPath, '')
  console.log('apps: created!')

  // ESLint初期設定
  const eslintrcPath = path.resolve(path.join(projectName, '.eslintrc.yml'))
  fs.writeFileSync(eslintrcPath, await eslintrc)
  console.log('.eslintrc.yml: created!')

  // Prettier初期設定
  const prettierrcPath = path.resolve(path.join(projectName, '.prettierrc.yml'))
  fs.writeFileSync(prettierrcPath, await prettierrc)
  console.log('.prettierrc.yml: created!')

  // config dir
  const configDirPath = path.join(dirPath, 'config')
  mkdirp.sync(configDirPath)

  // goqoo.config
  const goqooConfigPath = path.join(configDirPath, 'goqoo.config.yml')
  fs.writeFileSync(goqooConfigPath, await goqooConfig)
  console.log('goqoo.config.yml: created!')

  // .env
  const sampleEnvPath = path.join(configDirPath, 'sample.env')
  fs.writeFileSync(sampleEnvPath, await sampleEnv)
  console.log('sample.env: created!')
  const dotEnvPath = path.join(configDirPath, '.env')
  fs.writeFileSync(dotEnvPath, '')
  console.log('.env: created!')

  // .goqoo dir
  const goqooDirPath = path.join(dirPath, '.goqoo')
  mkdirp.sync(goqooDirPath)

  // dropbox
  const dropboxPath = path.join(goqooDirPath, 'dropbox.js')
  fs.writeFileSync(dropboxPath, await dropbox)
  console.log('dropbox.js: created!')
}

module.exports = {
  goqooNew,
}
