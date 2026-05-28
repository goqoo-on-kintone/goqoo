import { build as viteBuild } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import type { ResolvedGoqooOptions } from './options'
import type { DevInfo } from './devinfo'
import { buildDevInfoBanner } from './banner'

type OrchestrateArgs = {
  root: string
  options: ResolvedGoqooOptions
  entries: Record<string, string>
  mode: string
  devInfo: DevInfo
}

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
          output: {
            // Vite 8 の lib モードは codeSplitting:false が既定のため
            // inlineDynamicImports は指定すると無視警告が出る。
            // 単一自己完結ファイルになることは lib モードが保証する。
            banner,
          },
        },
      },
    })
  }
}
