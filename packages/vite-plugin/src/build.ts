import { build as viteBuild } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import type { ResolvedGoqooOptions } from './options'
import type { DevInfo } from './devinfo'
import { buildDevInfoBanner } from './banner'
import { buildReloadSnippet } from './dev-server'

type OrchestrateArgs = {
  root: string
  options: ResolvedGoqooOptions
  entries: Record<string, string>
  mode: string
  devInfo: DevInfo
}

/** 本番/通常ビルド: 各エントリを dist/<name>.js（自己完結 IIFE）として書き出す */
export const orchestrateBuild = async ({ root, options, entries, mode, devInfo }: OrchestrateArgs): Promise<void> => {
  for (const [name, entry] of Object.entries(entries)) {
    const banner = options.devinfo ? buildDevInfoBanner(name, devInfo) : ''
    await viteBuild({
      root,
      configFile: false,
      logLevel: 'silent',
      mode,
      plugins: options.injectCss ? [cssInjectedByJsPlugin()] : [],
      build: {
        emptyOutDir: false,
        sourcemap: true,
        minify: mode === 'production',
        cssCodeSplit: false,
        lib: {
          entry,
          name: `__goqoo_${name}`,
          formats: ['iife'],
          fileName: () => `${name}.js`,
        },
        rollupOptions: {
          // Vite 8 の lib モードは codeSplitting:false が既定のため inlineDynamicImports は不要。
          // 単一自己完結ファイルになることは lib モードが保証する。
          output: { banner },
        },
      },
    })
  }
}

type BundleDevArgs = {
  root: string
  name: string
  entry: string
  options: ResolvedGoqooOptions
  mode: string
  devInfo: DevInfo
}

/**
 * dev サーバ用: 1 エントリを「全部入りの自己完結 IIFE 文字列」としてメモリ上に生成する。
 * 本番と同じ成果物形状（IIFE・CSSインライン・devinfo banner）に live-reload を加え、非minify。
 * kintone はこれをクラシック script として同期実行するため、二段ブートストラップは不要。
 */
export const bundleEntryDev = async ({ root, name, entry, options, mode, devInfo }: BundleDevArgs): Promise<string> => {
  const banner = (options.devinfo ? buildDevInfoBanner(name, devInfo) : '') + buildReloadSnippet()
  // build() は write:false のとき生成結果（RollupOutput）を返す。型が union で扱いづらいため局所的に any。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await viteBuild({
    root,
    configFile: false,
    logLevel: 'silent',
    mode,
    plugins: options.injectCss ? [cssInjectedByJsPlugin()] : [],
    build: {
      write: false,
      sourcemap: 'inline',
      minify: false,
      cssCodeSplit: false,
      lib: {
        entry,
        name: `__goqoo_${name}`,
        formats: ['iife'],
        fileName: () => `${name}.js`,
      },
      rollupOptions: { output: { banner } },
    },
  })
  const outputs = Array.isArray(result) ? result : [result]
  for (const out of outputs) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chunk = out.output?.find((o: any) => o.type === 'chunk' && o.isEntry)
    if (chunk?.code) return chunk.code as string
  }
  throw new Error(`goqoo: failed to bundle entry "${name}"`)
}
