const fs = require('fs-extra')
const path = require('path')
const { promisify } = require('util')
const { spawnSync } = require('child_process')
const minimist = require('minimist')
const inquirer = require('inquirer')
const chalk = require('chalk')

const { prettyln, trim } = require('./goqoo')

const createDefaultFilePath = (fileName, dirName = '') =>
  path.join(__dirname, '../defaultFiles', dirName, `def.${fileName}`)
const createPackageJson = require(createDefaultFilePath('package-json'))

const usageExit = (returnCode = 0) => {
  const message = trim(`
Usage:
 goqoo new PROJECT_PATH [options]

Options:
  -Y, [--skip-yarn] # Don't run yarn install

Goqoo options:
  -h, [--help]      # Show this help message and quit
  -v, [--version]   # Show Rails version number and quit
`)
  console.error(message)
  process.exit(returnCode)
}

const addOptionValues = async opts => {
  const argv = minimist(process.argv.slice(2), {
    boolean: ['skip-yarn'],
    alias: {
      Y: 'skip-yarn',
    },
  })

  opts.skipYarn = argv['skip-yarn']
}

const validateOptions = async opts => {
  if (opts.help) {
    usageExit(0)
  }
  if (!opts.target) {
    console.error(`No value provided for required arguments 'project_path'`)
    process.exit(1)
  }

  addOptionValues(opts)
}

const padding = str => ('            ' + str).substr(-12) + '  '

class FileCreator {
  constructor ({ projectDir, subDir, overwrite }) {
    this.projectDir = projectDir
    this.subDir = subDir || ''
    this.overwrite = overwrite
  }
  async copyFile (fileName) {
    const destAbsolutePath = path.join(this.projectDir, fileName)
    const destRelativePath = path.join(this.subDir, fileName)
    let fileStatus
    if (fs.existsSync(destAbsolutePath)) {
      console.log(chalk.bold.red(padding('conflict')) + destRelativePath)

      if (this.overwrite !== 'all') {
        this.overwrite = (await inquirer.prompt([
          {
            name: 'value',
            type: 'expand',
            message: `Overwrite ${destAbsolutePath}?`,
            choices: [
              {
                key: 'Y',
                name: 'yes, overwrite',
                value: 'yes',
              },
              {
                key: 'n',
                name: 'no, do not overwrite',
                value: 'no',
              },
              {
                key: 'a',
                name: 'all, overwrite this and all others',
                value: 'all',
              },
              {
                key: 'q',
                name: 'quit, abort',
                value: 'quit',
              },
              // {
              //   key: 'd',
              //   name: 'diff, show the differences between the old and the new',
              //   value: 'diff',
              // },
            ],
          },
        ])).value
      }

      switch (this.overwrite) {
        case 'yes':
        case 'all':
          fileStatus = chalk.bold.yellow(padding('force'))
          break
        case 'no':
          fileStatus = chalk.bold.yellow(padding('skip'))
          break
        case 'quit':
          console.log('Aborting...')
          process.exit()
        // case 'diff':
        //   break
      }
    } else {
      fileStatus = chalk.bold.green(padding('create'))
    }

    if (this.overwrite !== 'no') {
      fs.copySync(createDefaultFilePath(fileName, this.subDir), destAbsolutePath)
    }
    return fileStatus + destRelativePath
  }
}

const goqooNew = async opts => {
  validateOptions(opts)

  // プロジェクトディレクトリ作成
  const dirPath = path.resolve(opts.target)
  fs.mkdirpSync(dirPath)
  console.log(dirPath)
  const projectName = path.basename(dirPath)

  const fcRoot = new FileCreator({
    projectDir: dirPath,
  })

  // Git初期化
  console.log(await fcRoot.copyFile('.gitignore'))
  const gitInit = spawnSync('git', ['init'], { cwd: dirPath, stdio: 'inherit' })
  if (gitInit.code !== 0) {
    console.error(`git process exited with code ${gitInit.code}`)
  }

  // npm初期化、パッケージインストール
  const packageJson = createPackageJson(projectName)
  const packageJsonPath = path.resolve(path.join(dirPath, 'package.json'))
  fs.writeFileSync(packageJsonPath, prettyln(packageJson))
  console.log('package.json: created!')
  if (!opts.skipYarn) {
    const yarnInstall = spawnSync('yarn', ['install'], { cwd: dirPath, stdio: 'inherit' })
    if (yarnInstall.code !== 0) {
      console.error(`yarn process exited with code ${yarnInstall.code}`)
    }
  }

  // webpack初期設定
  console.log(await fcRoot.copyFile('webpack.config.js'))

  // apps dir
  const appsDir = path.join(dirPath, 'apps')
  fs.mkdirpSync(appsDir)
  const appsKeepPath = path.resolve(appsDir, '.gitkeep')
  fs.writeFileSync(appsKeepPath, '')
  console.log('apps: created!')

  // ESLint初期設定
  console.log(await fcRoot.copyFile('.eslintrc.yml'))

  // Prettier初期設定
  console.log(await fcRoot.copyFile('.prettierrc.yml'))

  // config dir
  const configDirPath = path.join(dirPath, 'config')
  fs.mkdirpSync(configDirPath)
  const fcConfig = new FileCreator({
    projectDir: fcRoot.projectDir,
    overwrite: fcRoot.overwrite,
    subDir: 'config',
  })

  // goqoo.config
  console.log(await fcConfig.copyFile('goqoo.config.yml'))

  // .env
  console.log(await fcConfig.copyFile('sample.env'))
  const dotEnvPath = path.join(configDirPath, '.env')
  fs.writeFileSync(dotEnvPath, '')
  console.log('.env: created!')

  // .goqoo dir
  const goqooDirPath = path.join(dirPath, '.goqoo')
  fs.mkdirpSync(goqooDirPath)
  const fcGoqoo = new FileCreator({
    projectDir: fcRoot.projectDir,
    overwrite: fcRoot.overwrite,
    subDir: '.goqoo',
  })

  // dropbox
  console.log(await fcGoqoo.copyFile('dropbox.js'))
}

module.exports = {
  goqooNew,
}
