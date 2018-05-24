#!/usr/bin/env node
'use strict'

const { createOptionValues, usageExit } = require('./lib/goqoo')
const { goqooNew } = require('./lib/goqoo-new')

const main = async () => {
  const opts = await createOptionValues()
  try {
    switch (opts.type) {
      case 'new':
        await goqooNew(opts)
        break
      default:
        usageExit(1)
    }
  } catch (error) {
    console.error(error)
  }
}

main()
