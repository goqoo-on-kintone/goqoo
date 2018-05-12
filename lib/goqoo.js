#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const minimist = require('minimist')
const mkdirp = require('mkdirp')
const { default: netrc } = require('netrc-parser')
const rcfile = require('rc-config-loader')

const pretty = obj => JSON.stringify(obj, null, '  ')
const prettyln = obj => pretty(obj) + '\n'
const trim = str => str.replace(/^\n|\n$/g, '')

// TODO: -vは早く実装する！
const usageExit = (returnCode = 0, command) => {
  let message
  switch (command) {
    case 'new':
      message = trim(`
usage: ginue new [<options>] <project name>

  -h, --help                    output usage information
`)
      break
    default:
      message = trim(`
usage: ginue [-v, --version] [-h, --help]
              new [<options>] <project name>
`)
  }
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
  const goqoorc = rcfile('ginue').config
  return Array.isArray(goqoorc) ? goqoorc : [goqoorc]
}

const createDirPath = opts => {
  return './'
}

const createFilePath = (opts, customFileName) => {
  const dirPath = createDirPath(opts)
  mkdirp.sync(dirPath)
  const fileName = customFileName || '.'
  return `${dirPath}/${fileName}`
}

const parseArgumentOptions = () => {
  const argv = minimist(process.argv.slice(2), {
    boolean: ['help'],
    alias: {
      h: 'help',
    },
  })
  if (argv._[0]) {
    argv.type = argv._[0]
  }
  if (argv._[1]) {
    argv.target = argv._[1]
  }

  return argv
}

const createOptionValues = async () => {
  const argv = parseArgumentOptions()

  if ((!argv.type && !argv.help) || (argv.type && !['new'].includes(argv.type))) {
    usageExit(1)
  }
  if (argv.help) {
    usageExit(0, argv.type)
  }

  // netrcに保存済みの情報取得
  netrc.loadSync()

  const opts = {}
  opts.type = argv.type
  opts.target = argv.target

  return opts
}

const goqooNew = async opts => {
  console.log('goqoo new!')
}

module.exports = {
  pretty,
  prettyln,
  trim,
  usageExit,
  loadJsonFile,
  loadGoqoorc,
  createDirPath,
  createFilePath,
  parseArgumentOptions,
  createOptionValues,
  goqooNew,
}
