#!/usr/bin/env node
'use strict'

const { createOptionValues } = require('./lib/goqoo')
const { goqooNew } = require('./lib/goqooNew')

const main = async () => {
  const opts = await createOptionValues()
  try {
    switch (opts.type) {
      case 'new':
        await goqooNew(opts)
        break
    }
  } catch (error) {
    console.error(error)
  }
}

main()
