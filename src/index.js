#!/usr/bin/env node
'use strict'

const { parseArgumentOptions, showVersion, usageExit } = require('./util')
const generator = require('./generator')
const bundlers = require('./bundlers')

const argv = parseArgumentOptions()
if (!argv._subCommand) {
  if (argv.version) {
    showVersion()
  } else if (argv.help) {
    usageExit(0)
  } else {
    usageExit(1)
  }
}

// TODO: --helpの扱いをうまくやる

if (['init', 'new', 'generate', 'g'].includes(argv._subCommand)) {
  generator(argv)
} else {
  bundlers(argv)
}
