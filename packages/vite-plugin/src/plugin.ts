import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import { rmSync, existsSync } from 'node:fs'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { resolveOptions, type GoqooOptions } from './options'
import { discoverEntries } from './entries'
import { resolveDevInfo } from './devinfo'
import { orchestrateBuild } from './build'
import { applyServerDefaults, buildBootstrapScript } from './dev-server'

const NOOP_ID = '\0goqoo-noop'

// kintone は https 前提のため dev では https が必須。basic-ssl が自己署名証明書を自動生成する。
// build では basic-ssl は no-op（apply:'serve'）。
export const goqoo = (rawOptions?: GoqooOptions): Plugin[] => {
  const options = resolveOptions(rawOptions)
  let root = process.cwd()
  let mode = 'development'
  let command: 'build' | 'serve' = 'build'

  const core: Plugin = {
    name: 'goqoo',
    config(userConfig, env) {
      if (env.command === 'serve') return applyServerDefaults(userConfig)
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
    configureServer(server) {
      const appsDir = resolve(root, options.appsDir)
      const relFor = (abs: string) => abs.slice(root.length + 1).replace(/\\/g, '/')
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0]
        const match = url.match(/^\/([^/]+)\.js$/)
        const name = match?.[1]
        let entries: Record<string, string> = {}
        try {
          entries = discoverEntries(appsDir)
        } catch {
          // appsDir が存在しない場合などは空のエントリで継続
        }
        if (name && entries[name]) {
          // 別オリジン(kintone)で実行されるため、dev サーバ自身の origin を Host から組み立てて絶対URLにする
          const encrypted = (req.socket as { encrypted?: boolean }).encrypted
          const origin = `${encrypted ? 'https' : 'http'}://${req.headers.host ?? 'localhost'}`
          res.setHeader('Content-Type', 'application/javascript')
          res.end(buildBootstrapScript(origin, relFor(entries[name])))
          return
        }
        next()
      })
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

  return [basicSsl(), core]
}
