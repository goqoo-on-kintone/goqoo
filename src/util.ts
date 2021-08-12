import fs from 'fs'
import path from 'path'
import minimist from 'minimist'
import netrc from 'netrc-parser'
import caller from 'caller'

const trim = (text: string) => text.replace(/^\n|\n$/g, '')

export const showVersion = (): void => {
  const { version } = require('../package.json')
  const { version: templateVersion } = require('@goqoo/templates/package.json')
  console.error(`Goqoo    version: ${version}`)
  console.error(`Template version: ${templateVersion}`)
  process.exit(0)
}

export const usageExit = (returnCode = 0): void => {
  const message = trim(`
usage: goqoo [-v, --version] [-h, --help]
              new <project name>
              generate <GENERATOR> <app name>
              build
              dev
              serve
`)
  console.error(message)
  process.exit(returnCode)
}

export const parseArgumentOptions = (): ReturnType<typeof minimist> => {
  const argv = minimist(process.argv.slice(2), {
    boolean: ['version', 'help'],
    alias: {
      v: 'version',
      h: 'help',
    },
  })
  if (argv._[0]) {
    argv._subCommand = argv._[0]
    argv._options = argv._.slice(1)
  }

  return argv
}

// TODO: この関数は抜本的に見直す
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

  const opts: any = {}
  opts.help = argv.help
  opts.type = argv.type
  opts.target = argv.target
  opts._ = argv._

  return opts
}

export const projectPath = (...args: string[]): string => path.resolve(...args)

export const currentPath = (...args: string[]): string => {
  const dir = path.dirname(caller())
  return path.resolve(dir, ...args)
}

export const existsDirectory = (directory: string): boolean => {
  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
    return false
  }
  return true
}
