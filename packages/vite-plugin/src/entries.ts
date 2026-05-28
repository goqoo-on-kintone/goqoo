import { readdirSync } from 'node:fs'
import { parse, resolve } from 'node:path'

/** appsDir 配下のファイルを { エントリ名: 絶対パス } で返す（dotfile 除外） */
export const discoverEntries = (appsDir: string): Record<string, string> => {
  const files = readdirSync(appsDir)
    .filter((file) => !file.startsWith('.'))
    .sort()
  return Object.fromEntries(files.map((file) => [parse(file).name, resolve(appsDir, file)]))
}
