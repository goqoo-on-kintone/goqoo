const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const mkdirp = require('mkdirp')
const { spawn } = require('child_process')

const { prettyln, usageExit } = require('./goqoo')

const createDefaultFilePath = fileName => path.join(__dirname, '../defaultFiles', `def.${fileName}`)
const createPackageJson = require(createDefaultFilePath('package-json'))
const readFilePromise = filePath => promisify(fs.readFile)(createDefaultFilePath(filePath), 'utf-8')
const gitignore = readFilePromise('gitignore.txt')
const eslintrc = readFilePromise('eslintrc.yml')
const prettierrc = readFilePromise('prettierrc.yml')
const webpackConfig = readFilePromise('webpack.config.js.txt')
const app1Js = readFilePromise('app1.js')

const validateOptions = async opts => {
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

  const app1Dir = path.join(projectName, 'src')
  mkdirp.sync(app1Dir)
  const app1Path = path.resolve(app1Dir, 'app1.js')
  fs.writeFileSync(app1Path, await app1Js)
  console.log('app1.js: created!')

  // ESLint初期設定
  const eslintrcPath = path.resolve(path.join(projectName, '.eslintrc.yml'))
  fs.writeFileSync(eslintrcPath, await eslintrc)
  console.log('.eslintrc.yml: created!')

  // Prettier初期設定
  const prettierrcPath = path.resolve(path.join(projectName, '.prettierrc.yml'))
  fs.writeFileSync(prettierrcPath, await prettierrc)
  console.log('.prettierrc.yml: created!')
}

module.exports = {
  goqooNew,
}
