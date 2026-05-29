import type { Plugin } from 'vite'
import type { ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import { rmSync, existsSync } from 'node:fs'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { resolveOptions, type GoqooOptions } from './options'
import { discoverEntries } from './entries'
import { resolveDevInfo } from './devinfo'
import { orchestrateBuild, bundleEntryDev } from './build'
import { applyServerDefaults, RELOAD_PATH } from './dev-server'

const NOOP_ID = '\0goqoo-noop'

// kintone は https 前提のため dev では https が必須。basic-ssl が自己署名証明書を自動生成する。
// build では basic-ssl は no-op（apply:'serve'）。
export const goqoo = (rawOptions?: GoqooOptions): Plugin[] => {
  const options = resolveOptions(rawOptions)
  let root = process.cwd()
  let mode = 'development'
  let command: 'build' | 'serve' = 'build'

  // dev: 各エントリの「全部入り IIFE 文字列」をメモリに保持し、/<name>.js で同期配信する。
  const devCache = new Map<string, string>()
  const sseClients = new Set<ServerResponse>()

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
    async configureServer(server) {
      const appsDir = resolve(root, options.appsDir)
      const srcDir = resolve(root, 'src')

      // 全エントリを「全部入り IIFE」としてメモリにビルドし、変更通知を送る
      const rebuildAll = async () => {
        let entries: Record<string, string> = {}
        try {
          entries = discoverEntries(appsDir)
        } catch {
          // appsDir が無い等は空で継続
        }
        const devInfo = resolveDevInfo(mode)
        devCache.clear()
        await Promise.all(
          Object.entries(entries).map(async ([name, entry]) => {
            try {
              devCache.set(name, await bundleEntryDev({ root, name, entry, options, mode, devInfo }))
            } catch (e) {
              server.config.logger.error(`[goqoo] bundle failed: ${name}\n${(e as Error).message}`)
            }
          })
        )
        for (const client of sseClients) client.write('data: reload\n\n')
      }

      await rebuildAll()

      // src 配下の変更でリビルド＆リロード通知
      server.watcher.add(srcDir)
      const onChange = (file: string) => {
        if (file.startsWith(srcDir)) void rebuildAll()
      }
      server.watcher.on('change', onChange)
      server.watcher.on('add', onChange)
      server.watcher.on('unlink', onChange)

      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0]

        // live-reload の SSE エンドポイント
        if (url === RELOAD_PATH) {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*',
          })
          res.write('retry: 1000\n\n')
          sseClients.add(res)
          req.on('close', () => sseClients.delete(res))
          return
        }

        // /<name>.js を「全部入り IIFE」で同期配信
        const match = url.match(/^\/([^/]+)\.js$/)
        const name = match?.[1]
        if (name && devCache.has(name)) {
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(devCache.get(name))
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
