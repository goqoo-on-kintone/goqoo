const fs = require('fs-extra')
const path = require('path')
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
const progressLog = (color, fileStatus, relativePath) =>
  console.log(chalk.bold[color](padding(fileStatus)) + relativePath)

class FileCreator {
  constructor ({ projectDir, subDir, overwrite }) {
    this.projectDir = projectDir
    this.subDir = subDir || ''
    this.absoluteDirPath = path.join(this.projectDir, this.subDir)
    this.overwrite = overwrite
  }

  mkdirp () {
    if (fs.existsSync(this.absoluteDirPath)) {
      progressLog('blue', 'exist', this.subDir)
    } else {
      fs.mkdirpSync(this.absoluteDirPath)
      progressLog('green', 'create', this.subDir)
    }
  }

  async checkConflict (destAbsolutePath, destRelativePath) {
    let fileStatus = ['green', 'create']
    if (fs.existsSync(destAbsolutePath)) {
      progressLog('red', 'conflict', destRelativePath)

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
          fileStatus = ['yellow', 'force']
          break
        case 'no':
          fileStatus = ['yellow', 'skip']
          break
        case 'quit':
          console.log('Aborting...')
          process.exit()
        // case 'diff':
        //   break
      }
    }
    return fileStatus
  }

  isWrite (fileStatusArray) {
    const status = fileStatusArray[1]
    return ['create', 'force'].includes(status)
  }

  async createFile (fileName, content = '') {
    const destAbsolutePath = path.join(this.projectDir, this.subDir, fileName)
    const destRelativePath = path.join(this.subDir, fileName)
    const fileStatus = await this.checkConflict(destAbsolutePath, destRelativePath)

    if (this.isWrite(fileStatus)) {
      fs.writeFileSync(destAbsolutePath, content)
    }
    progressLog(...fileStatus, destRelativePath)
  }

  async copyFile (fileName) {
    const destAbsolutePath = path.join(this.projectDir, this.subDir, fileName)
    const destRelativePath = path.join(this.subDir, fileName)
    const fileStatus = await this.checkConflict(destAbsolutePath, destRelativePath)

    if (this.isWrite(fileStatus)) {
      fs.copySync(createDefaultFilePath(fileName, this.subDir), destAbsolutePath)
    }
    progressLog(...fileStatus, destRelativePath)
  }
}

const goqooNew = async opts => {
  validateOptions(opts)

  // プロジェクトディレクトリ作成
  const fcRoot = new FileCreator({
    projectDir: path.resolve(opts.target),
  })
  fcRoot.mkdirp()

  // Git初期化
  await fcRoot.copyFile('.gitignore')
  progressLog('green', 'run', 'git init')
  const gitInit = spawnSync('git', ['init'], { cwd: fcRoot.projectDir, stdio: 'inherit' })
  if (gitInit.code !== 0) {
    console.error(`git process exited with code ${gitInit.code}`)
  }

  // npm初期化、パッケージインストール
  const projectName = path.basename(fcRoot.projectDir)
  const packageJson = createPackageJson(projectName)
  await fcRoot.createFile('package.json', prettyln(packageJson))
  if (!opts.skipYarn) {
    progressLog('green', 'run', 'yarn install')
    const yarnInstall = spawnSync('yarn', ['install'], { cwd: fcRoot.projectDir, stdio: 'inherit' })
    if (yarnInstall.code !== 0) {
      console.error(`yarn process exited with code ${yarnInstall.code}`)
    }
  }

  await fcRoot.copyFile('webpack.config.js')
  await fcRoot.copyFile('.eslintrc.yml')
  await fcRoot.copyFile('.prettierrc.yml')

  // apps dir
  const fcApps = new FileCreator({
    projectDir: fcRoot.projectDir,
    overwrite: fcRoot.overwrite,
    subDir: 'apps',
  })
  fcApps.mkdirp()
  await fcApps.createFile('.gitkeep')

  // config dir
  const fcConfig = new FileCreator({
    projectDir: fcRoot.projectDir,
    overwrite: fcRoot.overwrite,
    subDir: 'config',
  })
  fcConfig.mkdirp()
  await fcConfig.copyFile('goqoo.config.yml')
  await fcConfig.copyFile('sample.env')
  await fcConfig.createFile('.env')

  // .goqoo dir
  const fcGoqoo = new FileCreator({
    projectDir: fcRoot.projectDir,
    overwrite: fcRoot.overwrite,
    subDir: '.goqoo',
  })
  fcGoqoo.mkdirp()
  await fcGoqoo.copyFile('dropbox.js')
}

module.exports = {
  goqooNew,
}
