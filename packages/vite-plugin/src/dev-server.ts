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
 */
export const buildBootstrapScript = (_name: string, entryRelPath: string): string => {
  const entryUrl = '/' + entryRelPath.replace(/\\/g, '/')
  return `(() => {
  const inject = (src) => {
    const s = document.createElement('script')
    s.type = 'module'
    s.src = src
    document.head.appendChild(s)
  }
  inject('/@vite/client')
  inject(${JSON.stringify(entryUrl)})
})();`
}
