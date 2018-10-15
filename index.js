#!/usr/bin/env node
'use strict'

const { parseArgumentOptions, showVersion, usageExit } = require('./lib/goqoo')
const { spawnSync } = require('child_process')
const path = require('path')
const fs = require('fs-extra')

const argv = parseArgumentOptions()
if (!argv.subCommand) {
  if (argv.version) {
    showVersion()
  } else if (argv.help) {
    usageExit(0)
  } else {
    usageExit(1)
  }
}

const rawArgv = process.argv.slice(3)
let subGenerator
let cwd = null

// TODO: --helpの扱いをうまくやる
switch (argv.subCommand) {
  case 'init':
    subGenerator = 'app'
    break
  case 'new':
    subGenerator = 'app'
    const projectDir = rawArgv.shift()
    cwd = path.resolve(projectDir)
    fs.mkdirpSync(cwd)
    break
  case 'generate':
  case 'g':
    subGenerator = `g-${rawArgv.shift()}`
    break
  default:
    usageExit(1)
}

const yeoman = spawnSync('yo', [`goqoo:${subGenerator}`, ...rawArgv], { stdio: 'inherit', cwd })
process.exit(yeoman.status)
