import type { DevInfo } from './devinfo'

/** エントリ先頭に注入する window.__devinfo__ 代入文を返す */
export const buildDevInfoBanner = (entryName: string, info: DevInfo): string => {
  const name = JSON.stringify(entryName)
  const payload = JSON.stringify(info)
  return `;(window.__devinfo__ = window.__devinfo__ || {})[${name}] = ${payload};\n`
}
