const fs = require('fs')
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

  if (!['app', 'scaffold'].includes(opts.generator)) {
    usageExit(1)
  }
}

const isExistDir = file => fs.existsSync(file) && fs.statSync(file).isDirectory()

const validateProject = () => {
  // TODO: もう少し本質的なチェックを考える。何を以って「Goqooプロジェクト」とみなすか？
  if (!isExistDir('.goqoo')) {
    console.error('ERROR: Not Goqoo project')
    process.exit(1)
  }
}

const goqooGenerate = async opts => {
  opts.generator = opts.target
  opts.target = opts._[2]
  validateOptions(opts)
  validateProject()
}

module.exports = {
  goqooGenerate,
}
