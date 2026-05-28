import type { Answers } from './types'

export type PackageJson = {
  name: string
  version: string
  private: true
  type: 'module'
  scripts: Record<string, string>
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}

export const buildPackageJson = (answers: Answers): PackageJson => {
  const scripts: Record<string, string> = {
    dev: 'vite',
    build: 'vite build --mode development',
    release: 'vite build --mode production',
    watch: 'vite build --watch --mode development',
    typecheck: 'tsc --noEmit',
    upload: 'kintone-customize-uploader customize-manifest.json',
  }
  const devDependencies: Record<string, string> = {
    typescript: '^5',
    '@kintone/customize-uploader': '^9',
  }

  if (answers.gyuma) {
    devDependencies['gyuma'] = 'latest'
    // customize-uploader は KINTONE_OAUTH_TOKEN 環境変数を読む。
    // 注意: `VAR=$(...) cmd "$VAR"` だと "$VAR" が代入前に展開され空になるため、引数渡しはしない。
    scripts['upload:oauth'] =
      'KINTONE_OAUTH_TOKEN=$(gyuma --domain "$KINTONE_DOMAIN" --scope k:app_settings:read k:app_settings:write k:file:write) kintone-customize-uploader customize-manifest.json'
  }
  if (answers.trunks) {
    devDependencies['trunks'] = 'latest'
    scripts['dts'] = 'trunks'
  }
  if (answers.ginue) {
    devDependencies['ginue'] = 'latest'
    scripts['ginue:pull'] = 'ginue pull'
  }

  return {
    name: answers.name,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts,
    dependencies: {
      vite: '^8',
      '@goqoo/vite-plugin': '^2',
      '@goqoo/lib': '^2',
    },
    devDependencies,
  }
}

export const buildClaudeMd = (answers: Answers): string => {
  const tool = (cond: boolean, text: string) => (cond ? text : '')
  return `# ${answers.name}

kintone カスタマイズプロジェクト（goqoo v2）。

## プロジェクト構造
- \`src/apps/<name>.ts\` … 各ファイルが 1 つのカスタマイズJS（エントリ）になります。ビルドで \`dist/<name>.js\` が生成されます。

## エントリの書き方
\`goqoo(entryName, callback)\` で二重実行を防ぎつつ処理を登録します。
\`\`\`ts
import { goqoo } from '@goqoo/lib'
goqoo('sample', () => {
  kintone.events.on('app.record.index.show', (event) => {
    // ここにカスタマイズを書く
    return event
  })
})
\`\`\`

## ダイアログ（@goqoo/lib）
\`confirmDialog\` / \`successDialog\` / \`errorDialog\` / \`helloGoqoo\` を提供します（SweetAlert2 ベース）。

## アップロード
\`npm run upload\` で \`customize-manifest.json\` に従い kintone へアップロードします（パスワード認証）。${tool(
    answers.gyuma,
    '\nOAuth 認証は \`npm run upload:oauth\`（gyuma でトークン取得）を使います。'
  )}
${tool(answers.ginue, '\n## ginue\nkintone アプリ設定の取得/反映に ginue を使います（\`npm run ginue:pull\`）。')}
${tool(answers.trunks, '\n## trunks\n型定義生成に trunks を使います（\`npm run dts\`）。')}
`
}
