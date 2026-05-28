import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import { rmSync, existsSync } from 'node:fs'
import { resolveOptions, type GoqooOptions } from './options'
import { discoverEntries } from './entries'
import { resolveDevInfo } from './devinfo'
import { orchestrateBuild } from './build'

const NOOP_ID = '\0goqoo-noop'

export const goqoo = (rawOptions?: GoqooOptions): Plugin => {
  const options = resolveOptions(rawOptions)
  let root = process.cwd()
  let mode = 'development'
  let command: 'build' | 'serve' = 'build'

  return {
    name: 'goqoo',
    config(_userConfig, env) {
      if (env.command === 'serve') return undefined
      return { build: { write: false, emptyOutDir: false, rollupOptions: { input: NOOP_ID } } }
    },
    resolveId(id) {
      return id === NOOP_ID ? NOOP_ID : undefined
    },
    load(id) {
      return id === NOOP_ID ? 'export {}' : undefined
    },
    configResolved(config) {
      root = config.root
      mode = config.mode
      command = config.command
    },
    async buildStart() {
      if (command !== 'build') return
      const appsDir = resolve(root, options.appsDir)
      const entries = discoverEntries(appsDir)
      const devInfo = resolveDevInfo(mode)
      const outDir = resolve(root, 'dist')
      if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true })
      await orchestrateBuild({ root, options, entries, mode, devInfo })
    },
  }
}
