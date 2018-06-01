#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const minimist = require('minimist')
const { default: netrc } = require('netrc-parser')
const rcfile = require('rc-config-loader')

const pretty = obj => JSON.stringify(obj, null, '  ')
const prettyln = obj => pretty(obj) + '\n'
const trim = str => str.replace(/^\n|\n$/g, '')

// TODO: -vは早く実装する！
const usageExit = (returnCode = 0) => {
  const message = trim(`
usage: goqoo [-v, --version] [-h, --help]
              new [<options>] <project name>
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

  if (!argv.type) {
    if (argv.help) {
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
  usageExit,
  loadJsonFile,
  loadGoqoorc,
  parseArgumentOptions,
  createOptionValues,
}
