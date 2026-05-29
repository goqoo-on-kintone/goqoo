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

/** dev サーバが配信する live-reload エンドポイント（SSE）のパス */
export const RELOAD_PATH = '/__goqoo_reload__'

/**
 * dev ビルドの先頭に仕込む live-reload クライアント。
 * 自身の <script> の origin を基準に SSE へ接続し、変更通知で画面全体を reload する。
 * kintone 等の別オリジンのページで実行されるため、currentScript.src から origin を導出する。
 */
export const buildReloadSnippet = (): string => `;(() => {
  try {
    var s = document.currentScript && document.currentScript.src
    if (!s) return
    var es = new EventSource(new URL(s).origin + ${JSON.stringify(RELOAD_PATH)})
    es.onmessage = function () { location.reload() }
  } catch (e) { console.error('[goqoo] live-reload error', e) }
})();
`
