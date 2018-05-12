const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const { pretty, prettyln, trim, usageExit } = require('./goqoo')
const createPackageJson = require('./package-json-example')

const validateOptions = async opts => {
  if (!opts.target) {
    usageExit(1)
  }
}

const goqooNew = async opts => {
  validateOptions(opts)
  console.log('goqoo new!')
  const projectName = opts.target
  mkdirp.sync(projectName)
  const packageJson = createPackageJson(projectName)
  fs.writeFileSync(path.join(projectName, 'package.json'), prettyln(packageJson))
}

module.exports = {
  goqooNew,
}
