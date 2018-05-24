const { trim } = require('./goqoo')

const usageExit = (returnCode = 0) => {
  const message = trim(`
usage: goqoo generate <GENERATOR> [<options>]

-h, --help                    output usage information
`)
  console.error(message)
  process.exit(returnCode)
}

const validateOptions = async opts => {
  if (opts.help) {
    usageExit(0)
  }
  if (!opts.target) {
    usageExit(1)
  }
}

const goqooGenerate = async opts => {
  validateOptions(opts)
}

module.exports = {
  goqooGenerate,
}
