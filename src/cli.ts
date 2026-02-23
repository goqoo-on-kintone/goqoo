#!/usr/bin/env node

import { parseArgumentOptions, showVersion, usageExit } from './_common/util'
import generator from './generator'
import bundler from './bundler'
import { config } from 'dotenv'
config()

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

if (['new', 'generate', 'g'].includes(argv._subCommand)) {
  generator(argv)
} else {
  bundler(argv)
}
