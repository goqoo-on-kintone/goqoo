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
      // dev サーバ自身の origin。別オリジン(kintone)で実行される bootstrap に絶対URLで埋め込む。
      // HTTP/2 では Host ヘッダにポートが乗らないことがあるため、実際の listen アドレスから組み立てる。
      const resolveOrigin = (req: { headers: Record<string, string | string[] | undefined> }): string => {
        const proto = server.config.server.https ? 'https' : 'http'
        const host = String(req.headers.host ?? 'localhost').split(':')[0]
        const addr = server.httpServer?.address()
        const port = addr && typeof addr === 'object' ? addr.port : server.config.server.port
        return port ? `${proto}://${host}:${port}` : `${proto}://${host}`
      }
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
          res.setHeader('Content-Type', 'application/javascript')
          res.end(buildBootstrapScript(resolveOrigin(req), relFor(entries[name])))
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
