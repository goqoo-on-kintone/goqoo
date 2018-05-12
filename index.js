#!/usr/bin/env node
'use strict'

const { createOptionValues, goqooNew } = require('./lib/goqoo')

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
