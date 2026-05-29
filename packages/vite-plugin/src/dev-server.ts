import type { UserConfig } from 'vite'

const DEFAULT_PORT = 59000

/** kintone 向けの dev 既定値を、ユーザー指定を尊重しつつ補完した部分 config を返す */
export const applyServerDefaults = (config: UserConfig): UserConfig => {
  const server = config.server ?? {}
  return {
    server: {
      ...server,
      // https の証明書生成は @vitejs/plugin-basic-ssl が担う（goqoo() が同梱）。
      // ここで https を触ると basic-ssl の証明書付き設定と競合するため設定しない。
      cors: server.cors ?? true,
      port: server.port ?? DEFAULT_PORT,
    },
  }
}

/**
 * kintone に登録する /<name>.js が返すクラシックスクリプト。
 * @vite/client（HMR）と実 ESM エントリを type=module で注入する。
 * kintone 等の別オリジンのページで実行されるため、dev サーバの origin を含む
 * 絶対 URL で注入する（相対だとページ側オリジンに解決されて 404 になる）。
 */
export const buildBootstrapScript = (origin: string, entryRelPath: string): string => {
  const base = origin.replace(/\/$/, '')
  const entryUrl = base + '/' + entryRelPath.replace(/\\/g, '/')
  const clientUrl = base + '/@vite/client'
  return `(() => {
  const inject = (src) => {
    const s = document.createElement('script')
    s.type = 'module'
    s.src = src
    document.head.appendChild(s)
  }
  inject(${JSON.stringify(clientUrl)})
  inject(${JSON.stringify(entryUrl)})
})();`
}
