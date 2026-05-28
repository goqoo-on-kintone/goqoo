# create-goqoo 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development。各タスクは TDD。

**Goal:** `create-goqoo`（`npm create goqoo`）を @clack/prompts + 素のファイルコピーで実装し、kintone × Vite プロジェクトを scaffold する。

**Architecture:** CLI がプロンプトで回答を集め、`scaffold(answers, targetDir)` が「静的ベーステンプレートのコピー」＋「生成物（package.json / CLAUDE.md / ツールオーバーレイ）の書き込み」を行う。純粋ビルダー関数を TDD で固め、CLI は薄く保つ。

**Tech Stack:** TypeScript / tsup(esbuild, ESM bin) / @clack/prompts / Vitest

設計根拠: [create 設計書](./2026-05-28-create-design.md)。前提: monorepo 構築済み、`@goqoo/vite-plugin`/`@goqoo/lib` 実装済み。ブランチ `v2`。

## 確定事項 / 重要判断

- 配置 `packages/create/`、名称 `create-goqoo`、version `2.0.0`、bin `create-goqoo`。テンプレートは `packages/create/templates/` に同梱。
- プロンプト: name / description / ginue(Y/n) / gyuma(Y/n) / trunks(Y/n)。**フレームワーク選択は無し**（React/Vue 非同梱）。
- **生成スクリプトの mode 補正**（実装中に判明）: `vite build` は既定で production。よって dev ビルドは `vite build --mode development` とする。
- **ツール深い配線の現実解**: deps・npm scripts・CLAUDE.md 追記、および gyuma の OAuth upload コマンドは確実に配線する。一方 ginue の `.ginuerc` / trunks の設定ファイルは**スキーマ未確認のため TODO コメント付きスタブ**を生成し、ユーザー確認に委ねる（誤った schema を捏造しない）。この点は完了時に明示報告する。

## ファイル構成

CLI 実装:
- `packages/create/package.json` / `tsconfig.json` / `tsup.config.ts` / `vitest.config.ts`
- `packages/create/src/index.ts` — CLI エントリ（shebang・clack プロンプト・scaffold 呼び出し・git init/install/tips）
- `packages/create/src/types.ts` — `Answers`
- `packages/create/src/builders.ts` — 純粋: `buildPackageJson` / `buildClaudeMd` / `buildUploadScripts`
- `packages/create/src/scaffold.ts` — `scaffold(answers, targetDir)`：コピー＋生成＋オーバーレイ
- `packages/create/test/*.test.ts`

静的ベーステンプレート `packages/create/templates/base/`:
- `vite.config.ts` / `tsconfig.json` / `src/apps/sample.ts` / `goqoo.config.js`
- `customize-manifest.json` / `_gitignore` / `_env` / `_env.development` / `README.md`
- （`package.json` と `CLAUDE.md` は生成するのでテンプレートに置かない）

> dotfile は npm 公開で消えるため `_gitignore`→`.gitignore`、`_env`→`.env` のように `_` プレフィックスで同梱しコピー時にリネームする。

---

### Task CR1: パッケージ足場

**Files:** package.json / tsconfig.json / tsup.config.ts / vitest.config.ts / src/index.ts(stub)

- [ ] **Step 1: `packages/create/package.json`**

```json
{
  "name": "create-goqoo",
  "version": "2.0.0",
  "description": "Scaffold a kintone customization project (goqoo v2)",
  "type": "module",
  "bin": { "create-goqoo": "./dist/index.js" },
  "files": ["dist", "templates"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@clack/prompts": "^0.7.0"
  },
  "license": "MIT"
}
```
@clack/prompts のメジャーは最新に合わせてよい。

- [ ] **Step 2: `tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src", "types": ["node"] },
  "include": ["src"]
}
```

- [ ] **Step 3: `tsup.config.ts`**（shebang 付き ESM bin）

```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  banner: { js: '#!/usr/bin/env node' },
})
```

- [ ] **Step 4: `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
export default defineConfig({ test: { include: ['test/**/*.test.ts'] } })
```

- [ ] **Step 5: `src/index.ts`(stub)**

```ts
export {}
```

- [ ] **Step 6: deps インストール & ビルド**

Run: `pnpm --filter create-goqoo add -D tsup vitest typescript @types/node`
Run: `pnpm --filter create-goqoo build` → `dist/index.js` 生成。

- [ ] **Step 7: コミット** `chore: create-goqooパッケージの足場を追加`

---

### Task CR2: Answers 型と package.json ビルダー

**Files:** Create `src/types.ts`, `src/builders.ts`(部分), Test `test/builders.test.ts`

- [ ] **Step 1: 失敗テスト `test/builders.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { buildPackageJson } from '../src/builders'

const base = { name: 'myapp', description: 'd', ginue: false, gyuma: false, trunks: false }

describe('buildPackageJson', () => {
  it('基本の deps と scripts を含む（dev ビルドは --mode development）', () => {
    const pkg = buildPackageJson(base)
    expect(pkg.name).toBe('myapp')
    expect(pkg.dependencies).toHaveProperty('vite')
    expect(pkg.dependencies).toHaveProperty('@goqoo/vite-plugin')
    expect(pkg.dependencies).toHaveProperty('@goqoo/lib')
    expect(pkg.devDependencies).toHaveProperty('typescript')
    expect(pkg.devDependencies).toHaveProperty('@kintone/customize-uploader')
    expect(pkg.scripts.dev).toBe('vite')
    expect(pkg.scripts.build).toBe('vite build --mode development')
    expect(pkg.scripts.release).toBe('vite build --mode production')
    expect(pkg.scripts.typecheck).toBe('tsc --noEmit')
    expect(pkg.scripts.upload).toContain('kintone-customize-uploader')
  })

  it('gyuma 選択時は gyuma devDep と upload:oauth を追加', () => {
    const pkg = buildPackageJson({ ...base, gyuma: true })
    expect(pkg.devDependencies).toHaveProperty('gyuma')
    expect(pkg.scripts['upload:oauth']).toContain('gyuma')
    expect(pkg.scripts['upload:oauth']).toContain('kintone-customize-uploader')
  })

  it('trunks 選択時は trunks devDep と dts script を追加', () => {
    const pkg = buildPackageJson({ ...base, trunks: true })
    expect(pkg.devDependencies).toHaveProperty('trunks')
    expect(pkg.scripts.dts).toBeDefined()
  })

  it('ginue 選択時は ginue devDep と ginue script を追加', () => {
    const pkg = buildPackageJson({ ...base, ginue: true })
    expect(pkg.devDependencies).toHaveProperty('ginue')
    expect(pkg.scripts['ginue:pull']).toBeDefined()
  })
})
```

- [ ] **Step 2: 失敗確認** → FAIL

- [ ] **Step 3: 実装 `src/types.ts`**

```ts
export type Answers = {
  name: string
  description: string
  ginue: boolean
  gyuma: boolean
  trunks: boolean
}
```

- [ ] **Step 4: 実装 `src/builders.ts`（buildPackageJson）**

```ts
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
    scripts['upload:oauth'] =
      'KINTONE_OAUTH_TOKEN=$(gyuma --domain "$KINTONE_DOMAIN" --scope k:app_settings:read k:app_settings:write k:file:write) kintone-customize-uploader --oauth-token "$KINTONE_OAUTH_TOKEN" customize-manifest.json'
  }
  if (answers.trunks) {
    devDependencies['trunks'] = 'latest'
    scripts['dts'] = 'trunks' // TODO: trunks の正確な CLI 引数は要確認
  }
  if (answers.ginue) {
    devDependencies['ginue'] = 'latest'
    scripts['ginue:pull'] = 'ginue pull' // TODO: ginue の正確なサブコマンドは要確認
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
```

> NOTE: `gyuma`/`trunks`/`ginue` のバージョンは `latest` 文字列で生成（scaffold 後に `pnpm install` が解決）。`@goqoo/*` は公開前は workspace の最新に合わせる想定（公開後 `^2`）。

- [ ] **Step 5: 緑確認** → PASS
- [ ] **Step 6: コミット** `feat(create): Answers型とpackage.jsonビルダーを追加`

---

### Task CR3: CLAUDE.md ビルダー

**Files:** Modify `src/builders.ts`, Test `test/builders.test.ts`（追加）

- [ ] **Step 1: 失敗テスト追加**

```ts
import { buildClaudeMd } from '../src/builders'

describe('buildClaudeMd', () => {
  it('主要セクションとツール記述を含む', () => {
    const md = buildClaudeMd({ name: 'myapp', description: 'd', ginue: true, gyuma: true, trunks: false })
    expect(md).toContain('src/apps/')
    expect(md).toContain('goqoo(')
    expect(md).toContain('@goqoo/lib')
    expect(md).toContain('アップロード')
    expect(md).toContain('gyuma') // gyuma 選択時のみ
    expect(md).toContain('ginue') // ginue 選択時のみ
    expect(md).not.toContain('trunks') // 未選択
  })
})
```

- [ ] **Step 2: 失敗確認** → FAIL

- [ ] **Step 3: 実装（`src/builders.ts` に追記）**

```ts
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
```

- [ ] **Step 4: 緑確認** → PASS
- [ ] **Step 5: コミット** `feat(create): CLAUDE.mdビルダーを追加`

---

### Task CR4: 静的ベーステンプレート

**Files:** `templates/base/**`

- [ ] **Step 1: テンプレートファイル群を作成**

`templates/base/vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import { goqoo } from '@goqoo/vite-plugin'

export default defineConfig({
  plugins: [goqoo({ appsDir: 'src/apps' })],
})
```
`templates/base/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2021", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

`templates/base/src/kintone.d.ts`（kintone グローバルの最小アンビエント宣言。これが無いと sample.ts の `kintone` 参照で `tsc` が落ちる）:
```ts
// kintone グローバルの最小宣言。正式な型が必要なら trunks 等で生成して置き換える。
declare const kintone: any
```

`templates/base/src/apps/sample.ts`:
```ts
import { goqoo } from '@goqoo/lib'

goqoo('sample', () => {
  kintone.events.on('app.record.index.show', (event) => {
    console.log('Hello, goqoo!')
    return event
  })
})
```
`templates/base/goqoo.config.js`（生成プロジェクトは `type: module` のため ESM で書く）:
```js
// kintone 接続先（upload ツール等が参照）。plugin は参照しません。
export default {
  environments: [
    {
      env: 'development',
      host: 'https://example.cybozu.com',
      appId: { sample: 1 },
      auth: { type: 'password' },
    },
  ],
}
```
`templates/base/customize-manifest.json`:
```json
{
  "app": "1",
  "scope": "ALL",
  "desktop": { "js": ["dist/sample.js"], "css": [] },
  "mobile": { "js": ["dist/sample.js"] }
}
```
`templates/base/_gitignore`:
```
node_modules
dist
.env
.env.*
!.env.development
```
`templates/base/_env`:
```
KINTONE_DOMAIN=example.cybozu.com
```
`templates/base/_env.development`:
```
# 開発用の環境変数（import.meta.env で参照可能なものは VITE_ プレフィックス等の規約に従う）
```
`templates/base/README.md`:
```markdown
# kintone customization (goqoo v2)

## 開発
- `npm run dev` … 開発サーバ（HMR）
- `npm run build` … 開発ビルド（dist/<name>.js）
- `npm run release` … 本番ビルド（minify）
- `npm run upload` … kintone へアップロード

詳しくは CLAUDE.md を参照。
```

- [ ] **Step 2: コミット** `feat(create): 静的ベーステンプレートを追加`

---

### Task CR5: scaffold() とテスト

**Files:** Create `src/scaffold.ts`, Test `test/scaffold.test.ts`

- [ ] **Step 1: 失敗テスト `test/scaffold.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { mkdtempSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { scaffold } from '../src/scaffold'

const make = (overrides = {}) =>
  scaffoldTo({ name: 'myapp', description: 'd', ginue: false, gyuma: false, trunks: false, ...overrides })

function scaffoldTo(answers: any) {
  const dir = mkdtempSync(join(tmpdir(), 'create-goqoo-'))
  scaffold(answers, dir)
  return dir
}

describe('scaffold', () => {
  it('ベーステンプレートと生成物を書き出す', () => {
    const dir = make()
    expect(existsSync(join(dir, 'vite.config.ts'))).toBe(true)
    expect(existsSync(join(dir, 'src/apps/sample.ts'))).toBe(true)
    expect(existsSync(join(dir, 'customize-manifest.json'))).toBe(true)
    expect(existsSync(join(dir, '.gitignore'))).toBe(true) // _gitignore → .gitignore
    expect(existsSync(join(dir, '.env'))).toBe(true) // _env → .env
    expect(existsSync(join(dir, 'CLAUDE.md'))).toBe(true)
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
    expect(pkg.name).toBe('myapp')
    expect(pkg.scripts.build).toBe('vite build --mode development')
  })

  it('ginue 選択時は .ginuerc スタブを生成する', () => {
    const dir = make({ ginue: true })
    expect(existsSync(join(dir, '.ginuerc.json'))).toBe(true)
  })
})
```

- [ ] **Step 2: 失敗確認** → FAIL

- [ ] **Step 3: 実装 `src/scaffold.ts`**

```ts
import { cpSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Answers } from './types'
import { buildPackageJson, buildClaudeMd } from './builders'

const here = dirname(fileURLToPath(import.meta.url))
// dist/ から見た templates/base（公開時は dist と templates が同階層）
const templateDir = join(here, '../templates/base')

const renameDotfiles = (dir: string) => {
  const pairs: [string, string][] = [
    ['_gitignore', '.gitignore'],
    ['_env', '.env'],
    ['_env.development', '.env.development'],
  ]
  for (const [from, to] of pairs) {
    const src = join(dir, from)
    if (existsSync(src)) renameSync(src, join(dir, to))
  }
}

export const scaffold = (answers: Answers, targetDir: string): void => {
  mkdirSync(targetDir, { recursive: true })
  cpSync(templateDir, targetDir, { recursive: true })
  renameDotfiles(targetDir)

  writeFileSync(join(targetDir, 'package.json'), JSON.stringify(buildPackageJson(answers), null, 2) + '\n')
  writeFileSync(join(targetDir, 'CLAUDE.md'), buildClaudeMd(answers))

  // ツール別オーバーレイ（deep wiring）
  if (answers.ginue) {
    // TODO: ginue の正確な .ginuerc スキーマは要確認。最小スタブを生成。
    const ginuerc = {
      location: '.',
      env: {
        development: { domain: 'example.cybozu.com', username: '', password: '', app: { sample: '1' } },
      },
    }
    writeFileSync(join(targetDir, '.ginuerc.json'), JSON.stringify(ginuerc, null, 2) + '\n')
  }
  if (answers.trunks) {
    // TODO: trunks の正確な設定スキーマは要確認。最小スタブを生成。
    writeFileSync(
      join(targetDir, 'trunks.config.js'),
      '// TODO: trunks の設定。詳細は trunks のドキュメントを参照。\nmodule.exports = {}\n'
    )
  }
}
```

> NOTE: ginue/trunks の設定スキーマは未確認のため TODO スタブ。gyuma は package.json の `upload:oauth` で配線済み（別ファイル不要）。

- [ ] **Step 4: 緑確認** → PASS
- [ ] **Step 5: コミット** `feat(create): scaffold(answers,targetDir)を追加`

---

### Task CR6: CLI エントリ

**Files:** `src/index.ts`

- [ ] **Step 1: CLI 実装**（プロンプト→scaffold→完了案内。ユニットテストはしない。手動 smoke は完了条件で実施）

```ts
import { intro, outro, text, confirm, isCancel, cancel, log } from '@clack/prompts'
import { resolve, basename } from 'node:path'
import { existsSync } from 'node:fs'
import { scaffold } from './scaffold'
import type { Answers } from './types'

const main = async () => {
  intro('create-goqoo')

  const targetArg = process.argv[2]
  const targetDir = resolve(process.cwd(), targetArg ?? '.')

  const name = await text({
    message: 'Project name',
    initialValue: targetArg ? basename(targetDir) : '',
    validate: (v) => (v.length === 0 ? '必須です' : undefined),
  })
  if (isCancel(name)) return cancel('中止しました')

  const description = await text({ message: 'Description', initialValue: '' })
  if (isCancel(description)) return cancel('中止しました')

  const ginue = await confirm({ message: 'ginue を使いますか？', initialValue: false })
  if (isCancel(ginue)) return cancel('中止しました')
  const gyuma = await confirm({ message: 'gyuma を使いますか？', initialValue: false })
  if (isCancel(gyuma)) return cancel('中止しました')
  const trunks = await confirm({ message: 'trunks を使いますか？', initialValue: false })
  if (isCancel(trunks)) return cancel('中止しました')

  if (existsSync(targetDir) && targetArg && targetArg !== '.') {
    log.warn(`${targetDir} は既に存在します。中身を上書きする可能性があります。`)
  }

  const answers: Answers = {
    name: String(name),
    description: String(description),
    ginue: Boolean(ginue),
    gyuma: Boolean(gyuma),
    trunks: Boolean(trunks),
  }

  scaffold(answers, targetDir)

  outro(`完成しました！\n  cd ${targetArg ?? '.'}\n  pnpm install\n  pnpm dev`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
```

- [ ] **Step 2: ビルド & 全テスト**

Run: `pnpm --filter create-goqoo build` → `dist/index.js`（shebang 付き）。
Run: `pnpm --filter create-goqoo test` → 全緑。

- [ ] **Step 3: 手動 smoke（任意・完了条件）**

一時ディレクトリで `node packages/create/dist/index.js /tmp/goqoo-smoke` を非対話で動かすのは難しい（プロンプトのため）。代わりに scaffold() のテストで生成内容を担保する。CLI の対話確認はレビュー時の手動チェックに委ねる。

- [ ] **Step 4: コミット** `feat(create): CLIエントリを追加`

---

### Task CR7: README + changeset

**Files:** `packages/create/README.md` / `.changeset/initial-create.md`

- [ ] **Step 1: `packages/create/README.md`**

# create-goqoo

kintone × Vite プロジェクトの scaffold（goqoo v2）。

```bash
npm create goqoo@latest my-app
```

プロンプトで ginue / gyuma / trunks の利用有無を選択できます。生成物には `@goqoo/vite-plugin` を差した `vite.config.ts`、`src/apps/` のサンプル、`customize-manifest.json`、AI 向け `CLAUDE.md` が含まれます。

- [ ] **Step 2: `.changeset/initial-create.md`**
```markdown
---
"create-goqoo": major
---

goqoo v2: create-goqoo を新規追加（scaffold CLI）
```

- [ ] **Step 3: ルートから全体ビルド・テスト**

Run: `pnpm -r build && pnpm -r test` → 全緑。

- [ ] **Step 4: コミット** `docs(create): READMEとchangesetを追加`

---

## 完了条件

- `pnpm --filter create-goqoo test` 全緑、`build` で shebang 付き `dist/index.js` 生成。
- `scaffold()` が base テンプレ + 生成 package.json/CLAUDE.md + ツールスタブを正しく書き出す（テストで担保）。
- `pnpm -r build && pnpm -r test`（全 3 パッケージ）が緑。

## 既知の制限 / 後続

- **ginue `.ginuerc` / trunks 設定は TODO スタブ**（各ツールの最新スキーマ未確認）。実利用前にユーザーが各ツールのドキュメントで補完する。完了時に明示報告すること。
- CLI の対話フローは自動テストせず scaffold() で担保。実際の `npm create goqoo` 体験はレビュー時に手動確認。
- **完了処理は create-vite 流に「次の一手を表示」のみ**（`git init` / 依存の自動インストールは行わない）。設計書は git init + install を挙げていたが、create-vite 流儀（@clack 採用）との一貫性を優先。自動化が必要ならユーザー判断で後追加。
- 公開前の `@goqoo/*` 依存はローカル workspace を指す必要がある（公開後は `^2`）。メタパッケージ `goqoo` と公開フローは後続計画。
- `customize-manifest.json` / `goqoo.config.js` の app 番号などはサンプル値。
