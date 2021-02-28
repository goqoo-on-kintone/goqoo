'use strict'

const fs = require('fs-extra')
const path = require('path')
const { promisify } = require('util')
const minimist = require('minimist')
const { default: netrc } = require('netrc-parser')
const rcfile = require('rc-config-loader')

const pretty = (obj) => JSON.stringify(obj, null, '  ')
const prettyln = (obj) => pretty(obj) + '\n'
const trim = (str) => str.replace(/^\n|\n$/g, '')

const showVersion = () => {
  const { version } = require('../package.json')
  console.error(`Goqoo ${version}`)
  process.exit(0)
}

const usageExit = (returnCode = 0) => {
  const message = trim(`
usage: goqoo [-v, --version] [-h, --help]
              init
              new <project name>
              generate <GENERATOR> <app name>
              build
              serve
`)
  console.error(message)
  process.exit(returnCode)
}

const loadJsonFile = async (fileName, dirName) => {
  const file = await promisify(fs.readFile)(path.join(dirName, fileName), 'utf8')
  try {
    const obj = JSON.parse(file)
    return obj
  } catch (e) {
    console.error(`ERROR: Invalid ${fileName}!`)
    process.exit(1)
  }
}

const loadGoqoorc = async () => {
  const goqoorc = rcfile('goqoo').config
  return Array.isArray(goqoorc) ? goqoorc : [goqoorc]
}

const createDefaultFilePath = (fileName, dirName = '') =>
  path.join(__dirname, '../defaultFiles', dirName, `def.${fileName}`)

const readFilePromise = (fileName, dirName) => promisify(fs.readFile)(createDefaultFilePath(fileName, dirName), 'utf-8')

const parseArgumentOptions = () => {
  const argv = minimist(process.argv.slice(2), {
    boolean: ['version', 'help'],
    alias: {
      v: 'version',
      h: 'help',
    },
  })
  if (argv._[0]) {
    argv.subCommand = argv._[0]
  }

  return argv
}

const createOptionValues = async () => {
  const argv = parseArgumentOptions()

  if (!argv.type) {
    if (argv.version) {
      showVersion()
    } else if (argv.help) {
      usageExit(0)
    } else {
      usageExit(1)
    }
  }

  // netrcに保存済みの情報取得
  netrc.loadSync()

  const opts = {}
  opts.help = argv.help
  opts.type = argv.type
  opts.target = argv.target
  opts._ = argv._

  return opts
}

module.exports = {
  pretty,
  prettyln,
  trim,
  showVersion,
  usageExit,
  loadJsonFile,
  loadGoqoorc,
  parseArgumentOptions,
  createOptionValues,
  readFilePromise,
}
