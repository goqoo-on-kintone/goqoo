import type { UserConfig } from 'vite'

const DEFAULT_PORT = 59000

/** kintone 向けの dev 既定値を、ユーザー指定を尊重しつつ補完した部分 config を返す */
export const applyServerDefaults = (config: UserConfig): UserConfig => {
  const server = config.server ?? {}
  return {
    server: {
      ...server,
      https: server.https ?? {},
      cors: server.cors ?? true,
      port: server.port ?? DEFAULT_PORT,
    },
  }
}
