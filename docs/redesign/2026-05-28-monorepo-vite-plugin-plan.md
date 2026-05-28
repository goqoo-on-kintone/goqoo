# モノレポ足場 + @goqoo/vite-plugin 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 現リポジトリを pnpm モノレポへ再構成し、`@goqoo/vite-plugin`（kintone 向け Vite プラグイン）を TDD で実装する。

**Architecture:** pnpm workspaces + Changesets(lockstep) の土台を作り、`packages/vite-plugin/` に kintone 制約（各エントリ = 共有チャンクなしの自己完結 IIFE）を満たすプラグインを実装する。プラグインは `vite build` 実行時に各エントリを Vite の `build({ configFile: false })` で個別ビルドするコーディネータとして動く。dev は `configureServer` ミドルウェアで本番同形 URL にブートストラップを返し HMR を効かせる。

**Tech Stack:** pnpm workspaces / Changesets / TypeScript / Vite（プラグイン + library mode + programmatic `build()`）/ Vitest

設計根拠は [vite-plugin 設計書](./2026-05-28-vite-plugin-design.md)、全体方針は [README](./README.md) を参照。

---

## 前提・進め方

- 既存の `src/` `dist/` `dts/` 等の旧構成は**この計画では削除しない**（v1 のまま温存）。新規 `packages/` 配下に v2 を作る。旧構成の撤去は別計画。
- パッケージのバージョンは **lockstep で 2.0.0**（[README のバージョン方針](./README.md)）。本計画では各 `package.json` の `version` を `2.0.0` とする。
- ルート直下に既存 `package.json`（v1, name=`goqoo`）がある。モノレポ化に伴い**ルート package.json は private なワークスペースルート**へ作り替える。**v1 の公開用メタ情報は後続のメタパッケージ計画で `packages/goqoo/` に移す**。本計画ではルートを private 化するに留める（既存 `dependencies`/`bin` 記述は一旦保持し、ビルドは新パッケージ側で完結させる）。

> ⚠️ ルート `package.json` を作り替える前に、現状をコミット済みであることを確認すること（`git status` がクリーン）。

---

## ファイル構成（このプランで作成/変更するもの）

- `pnpm-workspace.yaml`（新規）— ワークスペース定義
- `package.json`（変更）— private なワークスペースルートへ
- `.changeset/config.json`（新規）— Changesets 設定（fixed グループで lockstep）
- `tsconfig.base.json`（新規）— 共有 TS 設定
- `packages/vite-plugin/package.json`（新規）
- `packages/vite-plugin/tsconfig.json`（新規）
- `packages/vite-plugin/vitest.config.ts`（新規）
- `packages/vite-plugin/src/index.ts`（新規）— public export（`goqoo` / `goqooS3` / 型）
- `packages/vite-plugin/src/options.ts`（新規）— オプション正規化
- `packages/vite-plugin/src/entries.ts`（新規）— エントリ探索
- `packages/vite-plugin/src/build.ts`（新規）— per-entry IIFE オーケストレーション
- `packages/vite-plugin/src/banner.ts`（新規）— devinfo banner 生成
- `packages/vite-plugin/src/devinfo.ts`（新規）— ビルド情報算出（commitHash/builtAt/nodeEnv）
- `packages/vite-plugin/src/dev-server.ts`（新規）— configureServer ブートストラップ
- `packages/vite-plugin/src/s3.ts`（新規）— `goqooS3()` 別プラグイン
- `packages/vite-plugin/src/plugin.ts`（新規）— `goqoo()` プラグイン本体（hook 配線）
- `packages/vite-plugin/test/**`（新規）— Vitest 単体/結合テスト + fixtures

責務境界: 探索(`entries`)・情報算出(`devinfo`)・banner 生成(`banner`)・オーケストレーション(`build`)・dev(`dev-server`)・配線(`plugin`)を分離し、各ファイル 1 責務。

---

# Phase A — モノレポ足場

### Task A1: pnpm ワークスペース定義とルート private 化

**Files:**
- Create: `pnpm-workspace.yaml`
- Modify: `package.json`（ルート）

- [ ] **Step 1: 現状がクリーンか確認**

Run: `git status --porcelain`
Expected: 出力が空（クリーン）。空でなければ先にコミットする。

- [ ] **Step 2: `pnpm-workspace.yaml` を作成**

```yaml
packages:
  - 'packages/*'
```

- [ ] **Step 3: ルート `package.json` を private なワークスペースルートへ変更**

ルート `package.json` を以下の内容で上書きする（v1 の公開用フィールドは後続のメタパッケージ計画で復活させる）。

```json
{
  "name": "goqoo-monorepo",
  "version": "2.0.0",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test"
  },
  "license": "MIT"
}
```

> NOTE: `packageManager` のバージョンは環境の pnpm に合わせて調整可（`pnpm --version` で確認）。

- [ ] **Step 4: pnpm が認識するか確認**

Run: `pnpm -w install`
Expected: エラーなく完了（まだ packages が無いので最小限のインストール）。

- [ ] **Step 5: コミット**

```bash
git add pnpm-workspace.yaml package.json
git commit -m "chore: pnpm workspacesのルートを構成"
```

---

### Task A2: Changesets を lockstep 設定で導入

**Files:**
- Create: `.changeset/config.json`
- Modify: `package.json`（ルート、devDependencies に @changesets/cli）

- [ ] **Step 1: @changesets/cli を導入**

Run: `pnpm -w add -D @changesets/cli`
Expected: ルート `package.json` の devDependencies に `@changesets/cli` が入る。

- [ ] **Step 2: `.changeset/config.json` を作成（fixed グループで lockstep）**

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [["@goqoo/*", "create-goqoo", "goqoo"]],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

> `fixed` により列挙パッケージは常に同一バージョンでまとめて上がる（lockstep）。`create-goqoo` と メタ `goqoo` も将来追加されるため先に列挙しておく。

- [ ] **Step 3: 設定が読めるか確認**

Run: `pnpm changeset status --since=HEAD` （エラーにならないこと。差分が無ければ "No changesets" 等の出力）
Expected: 設定パースエラーが出ない。

- [ ] **Step 4: コミット**

```bash
git add .changeset/config.json package.json pnpm-lock.yaml
git commit -m "chore: Changesetsをlockstep設定で導入"
```

---

### Task A3: 共有 tsconfig

**Files:**
- Create: `tsconfig.base.json`

- [ ] **Step 1: `tsconfig.base.json` を作成**

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2021", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 2: コミット**

```bash
git add tsconfig.base.json
git commit -m "chore: 共有tsconfig.base.jsonを追加"
```

---

### Task A4: @goqoo/vite-plugin パッケージの足場

**Files:**
- Create: `packages/vite-plugin/package.json`
- Create: `packages/vite-plugin/tsconfig.json`
- Create: `packages/vite-plugin/vitest.config.ts`
- Create: `packages/vite-plugin/src/index.ts`

- [ ] **Step 1: `packages/vite-plugin/package.json` を作成**

```json
{
  "name": "@goqoo/vite-plugin",
  "version": "2.0.0",
  "description": "Vite plugin for kintone customization (goqoo v2)",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "peerDependencies": {
    "vite": ">=5"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.0.0",
    "vitest": "^1.6.0"
  },
  "license": "MIT"
}
```

> NOTE: vite/vitest のメジャーは実行環境で利用可能な最新安定版に合わせてよい（peer は緩めに `>=5`）。

- [ ] **Step 2: `packages/vite-plugin/tsconfig.json` を作成**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src"]
}
```

- [ ] **Step 3: `packages/vite-plugin/vitest.config.ts` を作成**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    testTimeout: 30_000,
  },
})
```

- [ ] **Step 4: `packages/vite-plugin/src/index.ts` をスタブ作成**

```ts
export const goqoo = () => {
  throw new Error('not implemented')
}
```

- [ ] **Step 5: 依存をインストールしビルドが通るか確認**

Run: `pnpm -w install && pnpm --filter @goqoo/vite-plugin build`
Expected: `dist/index.js` と `dist/index.d.ts` が生成される。

- [ ] **Step 6: コミット**

```bash
git add packages/vite-plugin package.json pnpm-lock.yaml
git commit -m "chore: @goqoo/vite-pluginパッケージの足場を追加"
```

---

# Phase B — vite-plugin コア

### Task B1: エントリ探索（discoverEntries）

**Files:**
- Create: `packages/vite-plugin/src/entries.ts`
- Test: `packages/vite-plugin/test/entries.test.ts`

- [ ] **Step 1: 失敗するテストを書く**

```ts
// test/entries.test.ts
import { describe, it, expect } from 'vitest'
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { discoverEntries } from '../src/entries'

describe('discoverEntries', () => {
  it('appsDir 内のファイルをエントリ名→絶対パスで返し、dotfile を除外する', () => {
    const root = mkdtempSync(join(tmpdir(), 'goqoo-'))
    const appsDir = join(root, 'src/apps')
    mkdirSync(appsDir, { recursive: true })
    writeFileSync(join(appsDir, 'foo.ts'), '')
    writeFileSync(join(appsDir, 'bar.ts'), '')
    writeFileSync(join(appsDir, '.keep'), '')

    const entries = discoverEntries(appsDir)

    expect(entries).toEqual({
      bar: join(appsDir, 'bar.ts'),
      foo: join(appsDir, 'foo.ts'),
    })
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `pnpm --filter @goqoo/vite-plugin test`
Expected: FAIL（`discoverEntries` 未定義）

- [ ] **Step 3: 最小実装を書く**

```ts
// src/entries.ts
import { readdirSync } from 'node:fs'
import { parse, resolve } from 'node:path'

/** appsDir 配下のファイルを { エントリ名: 絶対パス } で返す（dotfile 除外） */
export const discoverEntries = (appsDir: string): Record<string, string> => {
  const files = readdirSync(appsDir)
    .filter((file) => !file.startsWith('.'))
    .sort()
  return Object.fromEntries(files.map((file) => [parse(file).name, resolve(appsDir, file)]))
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `pnpm --filter @goqoo/vite-plugin test`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add packages/vite-plugin/src/entries.ts packages/vite-plugin/test/entries.test.ts
git commit -m "feat(vite-plugin): エントリ探索を追加"
```

---

### Task B2: オプション正規化（resolveOptions）

**Files:**
- Create: `packages/vite-plugin/src/options.ts`
- Test: `packages/vite-plugin/test/options.test.ts`

- [ ] **Step 1: 失敗するテストを書く**

```ts
// test/options.test.ts
import { describe, it, expect } from 'vitest'
import { resolveOptions } from '../src/options'

describe('resolveOptions', () => {
  it('既定値を補完する', () => {
    expect(resolveOptions(undefined)).toEqual({
      appsDir: 'src/apps',
      devinfo: true,
      injectCss: true,
    })
  })

  it('指定値を優先する', () => {
    expect(resolveOptions({ appsDir: 'app', devinfo: false })).toEqual({
      appsDir: 'app',
      devinfo: false,
      injectCss: true,
    })
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `pnpm --filter @goqoo/vite-plugin test options`
Expected: FAIL（`resolveOptions` 未定義）

- [ ] **Step 3: 最小実装を書く**

```ts
// src/options.ts
export type GoqooOptions = {
  appsDir?: string
  devinfo?: boolean
  injectCss?: boolean
}

export type ResolvedGoqooOptions = Required<GoqooOptions>

export const resolveOptions = (options: GoqooOptions | undefined): ResolvedGoqooOptions => ({
  appsDir: options?.appsDir ?? 'src/apps',
  devinfo: options?.devinfo ?? true,
  injectCss: options?.injectCss ?? true,
})
```

- [ ] **Step 4: テストが通ることを確認**

Run: `pnpm --filter @goqoo/vite-plugin test options`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add packages/vite-plugin/src/options.ts packages/vite-plugin/test/options.test.ts
git commit -m "feat(vite-plugin): オプション正規化を追加"
```

---

### Task B3: ビルド情報の算出（devinfo）

**Files:**
- Create: `packages/vite-plugin/src/devinfo.ts`
- Test: `packages/vite-plugin/test/devinfo.test.ts`

- [ ] **Step 1: 失敗するテストを書く**

```ts
// test/devinfo.test.ts
import { describe, it, expect } from 'vitest'
import { resolveDevInfo } from '../src/devinfo'

describe('resolveDevInfo', () => {
  it('mode と commitHash と builtAt(ISO) を返す', () => {
    const info = resolveDevInfo('production')
    expect(info.nodeEnv).toBe('production')
    expect(typeof info.commitHash).toBe('string')
    // ISO 8601
    expect(() => new Date(info.builtAt).toISOString()).not.toThrow()
    expect(new Date(info.builtAt).toISOString()).toBe(info.builtAt)
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `pnpm --filter @goqoo/vite-plugin test devinfo`
Expected: FAIL（`resolveDevInfo` 未定義）

- [ ] **Step 3: 最小実装を書く**

```ts
// src/devinfo.ts
import { execSync } from 'node:child_process'

export type DevInfo = {
  nodeEnv: string
  commitHash: string
  builtAt: string
}

const safeCommitHash = (): string => {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return 'unknown'
  }
}

export const resolveDevInfo = (mode: string): DevInfo => ({
  nodeEnv: mode,
  commitHash: safeCommitHash(),
  builtAt: new Date().toISOString(),
})
```

> NOTE: `DevInfo` 型は最終的に `@goqoo/lib` が所有する（[lib 設計書](./2026-05-28-lib-design.md)）。lib 実装後に lib から type-only import へ差し替える。本計画では vite-plugin 内に定義しておく。

- [ ] **Step 4: テストが通ることを確認**

Run: `pnpm --filter @goqoo/vite-plugin test devinfo`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add packages/vite-plugin/src/devinfo.ts packages/vite-plugin/test/devinfo.test.ts
git commit -m "feat(vite-plugin): ビルド情報(devinfo)算出を追加"
```

---

### Task B4: devinfo banner 生成

**Files:**
- Create: `packages/vite-plugin/src/banner.ts`
- Test: `packages/vite-plugin/test/banner.test.ts`

- [ ] **Step 1: 失敗するテストを書く**

```ts
// test/banner.test.ts
import { describe, it, expect } from 'vitest'
import { buildDevInfoBanner } from '../src/banner'

describe('buildDevInfoBanner', () => {
  it('window.__devinfo__[entryName] への代入文を生成する', () => {
    const banner = buildDevInfoBanner('foo', {
      nodeEnv: 'development',
      commitHash: 'abc1234',
      builtAt: '2026-05-28T00:00:00.000Z',
    })
    expect(banner).toContain('window.__devinfo__')
    expect(banner).toContain('"foo"')
    expect(banner).toContain('abc1234')
    // JSON 文字列が含まれ、実行可能な代入文であること
    expect(banner.trim().startsWith(';')).toBe(true)
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `pnpm --filter @goqoo/vite-plugin test banner`
Expected: FAIL（`buildDevInfoBanner` 未定義）

- [ ] **Step 3: 最小実装を書く**

```ts
// src/banner.ts
import type { DevInfo } from './devinfo'

/** エントリ先頭に注入する window.__devinfo__ 代入文を返す */
export const buildDevInfoBanner = (entryName: string, info: DevInfo): string => {
  const name = JSON.stringify(entryName)
  const payload = JSON.stringify(info)
  return `;(window.__devinfo__ = window.__devinfo__ || {})[${name}] = ${payload};\n`
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `pnpm --filter @goqoo/vite-plugin test banner`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add packages/vite-plugin/src/banner.ts packages/vite-plugin/test/banner.test.ts
git commit -m "feat(vite-plugin): devinfo banner生成を追加"
```

---

### Task B5: 【ウォーキングスケルトン】per-entry IIFE オーケストレーション

> このタスクが本プラグインの最重要・最大リスク。`vite build` 1 回で N 個の自己完結 IIFE が出ることを結合テストで証明する。ここが成立すれば以降は積み上げ。

**Files:**
- Create: `packages/vite-plugin/src/build.ts`
- Create: `packages/vite-plugin/src/plugin.ts`
- Modify: `packages/vite-plugin/src/index.ts`
- Test: `packages/vite-plugin/test/build.test.ts`
- Test fixtures: `packages/vite-plugin/test/fixtures/basic/src/apps/foo.ts`, `.../bar.ts`

- [ ] **Step 1: fixture を作成**

```ts
// test/fixtures/basic/src/apps/foo.ts
window.alert('foo')
export {}
```

```ts
// test/fixtures/basic/src/apps/bar.ts
window.alert('bar')
export {}
```

- [ ] **Step 2: 失敗する結合テストを書く**

```ts
// test/build.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { build } from 'vite'
import { readFileSync, existsSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { goqoo } from '../src/index'

const here = dirname(fileURLToPath(import.meta.url))
const fixture = join(here, 'fixtures/basic')
const dist = join(fixture, 'dist')

describe('goqoo() build orchestration', () => {
  beforeAll(async () => {
    if (existsSync(dist)) rmSync(dist, { recursive: true, force: true })
    await build({
      root: fixture,
      configFile: false,
      logLevel: 'silent',
      plugins: [goqoo({ appsDir: 'src/apps' })],
    })
  })

  it('各エントリが dist/<name>.js として出力される', () => {
    expect(existsSync(join(dist, 'foo.js'))).toBe(true)
    expect(existsSync(join(dist, 'bar.js'))).toBe(true)
  })

  it('各出力は共有チャンクを import しない自己完結ファイル（importステートメント無し）', () => {
    const foo = readFileSync(join(dist, 'foo.js'), 'utf8')
    expect(foo).not.toMatch(/^\s*import\s/m)
    expect(foo).not.toMatch(/from\s+["']\.\//m)
  })
})
```

- [ ] **Step 3: テストが失敗することを確認**

Run: `pnpm --filter @goqoo/vite-plugin test build`
Expected: FAIL（`goqoo` がスタブで throw）

- [ ] **Step 4: オーケストレーション実装を書く**

```ts
// src/build.ts
import { build as viteBuild } from 'vite'
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

/**
 * 各エントリを library mode(iife) で個別ビルドする。
 * configFile:false かつ goqoo プラグインを含めない子ビルドにすることで再帰しない。
 */
export const orchestrateBuild = async ({ root, options, entries, mode, devInfo }: OrchestrateArgs): Promise<void> => {
  for (const [name, entry] of Object.entries(entries)) {
    const banner = options.devinfo ? buildDevInfoBanner(name, devInfo) : ''
    await viteBuild({
      root,
      configFile: false,
      logLevel: 'silent',
      mode,
      build: {
        emptyOutDir: false,
        sourcemap: true,
        minify: mode === 'production',
        lib: {
          entry,
          name: `__goqoo_${name}`,
          formats: ['iife'],
          fileName: () => `${name}.js`,
        },
        rollupOptions: {
          output: {
            // IIFE は単一エントリなので共有チャンクは発生しないが、明示的に無効化
            inlineDynamicImports: true,
            banner,
          },
        },
      },
    })
  }
}
```

```ts
// src/plugin.ts
import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import { rmSync, existsSync } from 'node:fs'
import { resolveOptions, type GoqooOptions } from './options'
import { discoverEntries } from './entries'
import { resolveDevInfo } from './devinfo'
import { orchestrateBuild } from './build'

const NOOP_ID = '\0goqoo-noop'

export const goqoo = (rawOptions?: GoqooOptions): Plugin => {
  const options = resolveOptions(rawOptions)
  let root = process.cwd()
  let mode = 'development'
  let command: 'build' | 'serve' = 'build'

  return {
    name: 'goqoo',
    // コーディネータ（ユーザーの vite build）自身は何も書き出さない。
    // write:false + 仮想 noop エントリで Vite の input 必須エラーを回避しつつ、
    // 実出力は buildStart から呼ぶ子ビルドに任せる。
    config(_userConfig, env) {
      if (env.command === 'serve') return undefined
      return { build: { write: false, emptyOutDir: false, rollupOptions: { input: NOOP_ID } } }
    },
    resolveId(id) {
      return id === NOOP_ID ? NOOP_ID : undefined
    },
    load(id) {
      return id === NOOP_ID ? 'export {}' : undefined
    },
    configResolved(config) {
      root = config.root
      mode = config.mode
      command = config.command
    },
    async buildStart() {
      if (command !== 'build') return // dev(serve)の起動時 buildStart では何もしない
      const appsDir = resolve(root, options.appsDir)
      const entries = discoverEntries(appsDir)
      const devInfo = resolveDevInfo(mode)
      const outDir = resolve(root, 'dist')
      if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true })
      await orchestrateBuild({ root, options, entries, mode, devInfo })
    },
  }
}
```

> 実装メモ（このタスクの肝）:
> コーディネータ自身は `build.write = false` + 仮想 noop エントリにより **dist へ何も書き出さない**。
> 実際の `dist/<name>.js` は `buildStart` から呼ぶ子ビルド（`configFile:false` かつ goqoo プラグインを
> **含めない**ため再帰しない）が生成する。`buildStart` 冒頭で `dist` を一度だけ掃除し、子ビルドは
> `emptyOutDir:false` で追記する。`command !== 'build'` ガードにより dev 起動時の buildStart では
> オーケストレーションを走らせない。
>
> **完了条件は「テストが green になること」**（`foo.js`/`bar.js` が出力され import 文を含まない）。
> 万一 `write:false` でコーディネータが想定外の出力を残す場合は `closeBundle` で `dist` 内の
> noop 由来ファイルのみ削除する。

- [ ] **Step 5: index.ts を実装に差し替え**

```ts
// src/index.ts
export { goqoo } from './plugin'
export type { GoqooOptions } from './options'
export type { DevInfo } from './devinfo'
```

- [ ] **Step 6: テストが通ることを確認（必要なら上記メモの方式で調整）**

Run: `pnpm --filter @goqoo/vite-plugin test build`
Expected: PASS（`foo.js` `bar.js` が出力され、import 文を含まない）

- [ ] **Step 7: コミット**

```bash
git add packages/vite-plugin/src packages/vite-plugin/test
git commit -m "feat(vite-plugin): エントリ単位IIFEビルドのオーケストレーションを追加"
```

---

### Task B6: devinfo banner が出力に含まれることを結合テストで確認

**Files:**
- Test: `packages/vite-plugin/test/build.test.ts`（テスト追加）

- [ ] **Step 1: 失敗するテストを追加**

`test/build.test.ts` の `describe` 内に以下を追加する。

```ts
  it('出力に window.__devinfo__[entryName] への代入が含まれる', () => {
    const foo = readFileSync(join(dist, 'foo.js'), 'utf8')
    expect(foo).toContain('window.__devinfo__')
    expect(foo).toContain('"foo"')
  })
```

- [ ] **Step 2: テストを実行（B5 実装で既に banner 注入済みなら緑、未注入なら赤）**

Run: `pnpm --filter @goqoo/vite-plugin test build`
Expected: PASS（B5 の `orchestrateBuild` が `output.banner` を設定済みのため）。FAIL する場合は `orchestrateBuild` の banner 設定を見直す。

- [ ] **Step 3: コミット**

```bash
git add packages/vite-plugin/test/build.test.ts
git commit -m "test(vite-plugin): devinfo banner注入を結合テストで確認"
```

---

### Task B7: CSS を JS にインライン注入

**Files:**
- Modify: `packages/vite-plugin/src/build.ts`
- Modify: `packages/vite-plugin/package.json`（依存追加）
- Test fixtures: `.../fixtures/basic/src/apps/styled.ts`, `.../fixtures/basic/src/style.css`
- Test: `packages/vite-plugin/test/build.test.ts`

- [ ] **Step 1: css-injected-by-js プラグインを導入**

Run: `pnpm --filter @goqoo/vite-plugin add vite-plugin-css-injected-by-js`
Expected: `packages/vite-plugin/package.json` の dependencies に追加される。

- [ ] **Step 2: CSS を import する fixture を追加**

```css
/* test/fixtures/basic/src/style.css */
.goqoo-mark { color: rebeccapurple; }
```

```ts
// test/fixtures/basic/src/apps/styled.ts
import '../style.css'
document.body.classList.add('goqoo-mark')
export {}
```

- [ ] **Step 3: 失敗するテストを追加**

```ts
  it('CSS が JS 出力にインライン注入される（別 .css を出さない）', () => {
    const styled = readFileSync(join(dist, 'styled.js'), 'utf8')
    expect(styled).toContain('rebeccapurple')
    expect(existsSync(join(dist, 'styled.css'))).toBe(false)
  })
```

- [ ] **Step 4: テストが失敗することを確認**

Run: `pnpm --filter @goqoo/vite-plugin test build`
Expected: FAIL（既定では `styled.css` が分離出力される）

- [ ] **Step 5: orchestrateBuild に css-inject プラグインと cssCodeSplit:false を追加**

`src/build.ts` を修正する。

```ts
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
            inlineDynamicImports: true,
            banner,
          },
        },
      },
    })
  }
}
```

- [ ] **Step 6: テストが通ることを確認**

Run: `pnpm --filter @goqoo/vite-plugin test build`
Expected: PASS（`styled.js` に CSS が含まれ、`styled.css` は出ない）

- [ ] **Step 7: コミット**

```bash
git add packages/vite-plugin/src/build.ts packages/vite-plugin/package.json packages/vite-plugin/test pnpm-lock.yaml
git commit -m "feat(vite-plugin): CSSをJSへインライン注入"
```

---

### Task B8: dev server の kintone 向け既定値補完

**Files:**
- Create: `packages/vite-plugin/src/dev-server.ts`
- Modify: `packages/vite-plugin/src/plugin.ts`
- Test: `packages/vite-plugin/test/dev-server.test.ts`

- [ ] **Step 1: 失敗するテストを書く**

```ts
// test/dev-server.test.ts
import { describe, it, expect } from 'vitest'
import { applyServerDefaults } from '../src/dev-server'

describe('applyServerDefaults', () => {
  it('https/cors を既定で有効化し、未指定 port を補完する', () => {
    const result = applyServerDefaults({})
    expect(result.server?.cors).toBe(true)
    expect(result.server?.https).toBeTruthy()
    expect(result.server?.port).toBe(59000)
  })

  it('ユーザー指定を上書きしない', () => {
    const result = applyServerDefaults({ server: { port: 4000, cors: false } })
    expect(result.server?.port).toBe(4000)
    expect(result.server?.cors).toBe(false)
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `pnpm --filter @goqoo/vite-plugin test dev-server`
Expected: FAIL（`applyServerDefaults` 未定義）

- [ ] **Step 3: 最小実装を書く**

```ts
// src/dev-server.ts
import type { UserConfig } from 'vite'

const DEFAULT_PORT = 59000

/** kintone 向けの dev/preview 既定値を、ユーザー指定を尊重しつつ補完する */
export const applyServerDefaults = (config: UserConfig): UserConfig => {
  const server = config.server ?? {}
  return {
    ...config,
    server: {
      ...server,
      https: server.https ?? {},
      cors: server.cors ?? true,
      port: server.port ?? DEFAULT_PORT,
    },
  }
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `pnpm --filter @goqoo/vite-plugin test dev-server`
Expected: PASS

- [ ] **Step 5: plugin の config フックに serve 分岐を追加**

`src/plugin.ts` の `config()` に serve 分岐を足す（B5 の noop 機構・command ガード・dist 掃除は維持）。
差し替え後の全体は以下。

```ts
// src/plugin.ts
import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import { rmSync, existsSync } from 'node:fs'
import { resolveOptions, type GoqooOptions } from './options'
import { discoverEntries } from './entries'
import { resolveDevInfo } from './devinfo'
import { orchestrateBuild } from './build'
import { applyServerDefaults } from './dev-server'

const NOOP_ID = '\0goqoo-noop'

export const goqoo = (rawOptions?: GoqooOptions): Plugin => {
  const options = resolveOptions(rawOptions)
  let root = process.cwd()
  let mode = 'development'
  let command: 'build' | 'serve' = 'build'

  return {
    name: 'goqoo',
    config(userConfig, env) {
      if (env.command === 'serve') return applyServerDefaults(userConfig)
      return { build: { write: false, emptyOutDir: false, rollupOptions: { input: NOOP_ID } } }
    },
    resolveId(id) {
      return id === NOOP_ID ? NOOP_ID : undefined
    },
    load(id) {
      return id === NOOP_ID ? 'export {}' : undefined
    },
    configResolved(config) {
      root = config.root
      mode = config.mode
      command = config.command
    },
    async buildStart() {
      if (command !== 'build') return
      const appsDir = resolve(root, options.appsDir)
      const entries = discoverEntries(appsDir)
      const devInfo = resolveDevInfo(mode)
      const outDir = resolve(root, 'dist')
      if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true })
      await orchestrateBuild({ root, options, entries, mode, devInfo })
    },
  }
}
```

> NOTE: dev(serve) では `config()` が `applyServerDefaults` を返し、build では noop コーディネータ設定を返す。
> `buildStart` の `command !== 'build'` ガードにより、dev 起動時の buildStart ではオーケストレーションしない。

- [ ] **Step 6: 既存テストが壊れていないか確認**

Run: `pnpm --filter @goqoo/vite-plugin test`
Expected: PASS（全テスト緑）

- [ ] **Step 7: コミット**

```bash
git add packages/vite-plugin/src packages/vite-plugin/test
git commit -m "feat(vite-plugin): dev server向け既定値補完を追加"
```

---

### Task B9: dev HMR ブートストラップ配信（configureServer）

> kintone に登録する安定 URL `/<name>.js` に対し、`@vite/client` と実 ESM エントリを type=module で注入するクラシックスクリプトを返す。

**Files:**
- Modify: `packages/vite-plugin/src/dev-server.ts`
- Modify: `packages/vite-plugin/src/plugin.ts`
- Test: `packages/vite-plugin/test/dev-server.test.ts`

- [ ] **Step 1: 失敗するテストを書く（ブートストラップ本文の生成関数）**

```ts
// test/dev-server.test.ts に追記
import { buildBootstrapScript } from '../src/dev-server'

describe('buildBootstrapScript', () => {
  it('@vite/client と実エントリを動的 import するクラシックスクリプトを返す', () => {
    const script = buildBootstrapScript('foo', 'src/apps/foo.ts')
    expect(script).toContain('@vite/client')
    expect(script).toContain('/src/apps/foo.ts')
    // type=module の script として注入する形であること
    expect(script).toContain('script')
    expect(script).toContain('module')
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `pnpm --filter @goqoo/vite-plugin test dev-server`
Expected: FAIL（`buildBootstrapScript` 未定義）

- [ ] **Step 3: 実装を書く**

```ts
// src/dev-server.ts に追記
/**
 * kintone に登録する /<name>.js が返すクラシックスクリプト。
 * @vite/client（HMR）と実 ESM エントリを type=module で注入する。
 * 相対パス（origin 同一）で参照するため、kintone から見て dev server の origin に解決される。
 */
export const buildBootstrapScript = (name: string, entryRelPath: string): string => {
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
```

- [ ] **Step 4: テストが通ることを確認**

Run: `pnpm --filter @goqoo/vite-plugin test dev-server`
Expected: PASS

- [ ] **Step 5: configureServer ミドルウェアを plugin に配線**

`src/plugin.ts` の返すオブジェクトに `configureServer` を追加する。

```ts
    configureServer(server) {
      const appsDir = resolve(root, options.appsDir)
      const entries = discoverEntries(appsDir)
      const relFor = (abs: string) => abs.slice(root.length + 1).replace(/\\/g, '/')
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0]
        const match = url.match(/^\/([^/]+)\.js$/)
        const name = match?.[1]
        if (name && entries[name]) {
          res.setHeader('Content-Type', 'application/javascript')
          res.end(buildBootstrapScript(name, relFor(entries[name])))
          return
        }
        next()
      })
    },
```

`buildBootstrapScript` を import に追加すること。

- [ ] **Step 6: 全テストが緑か確認**

Run: `pnpm --filter @goqoo/vite-plugin test`
Expected: PASS

- [ ] **Step 7: コミット**

```bash
git add packages/vite-plugin/src packages/vite-plugin/test
git commit -m "feat(vite-plugin): dev HMRブートストラップ配信を追加"
```

- [ ] **Step 8: 【実機検証チェックポイント・手動】**

> 自動テストでは配信内容までしか確認できない。kintone 実機で以下を確認する（[設計書の検証項目](./2026-05-28-vite-plugin-design.md)）:
> - localhost の HTTPS 証明書（自己署名/mkcert）をブラウザが受理するか
> - kintone のカスタマイズ設定に `https://localhost:59000/<name>.js` を登録して読み込めるか
> - mixed content / CSP / CORS でブロックされないか
> - ファイル保存で HMR が反映されるか
>
> 成立しない場合は設計書のフォールバック（`vite build --watch` + 静的 HTTPS 配信）へ切り替える。**この検証が完了するまで HMR を「動作確認済み」と主張しない。**

---

# Phase C — S3 アップロード（別プラグイン）

### Task C1: goqooS3() の closeBundle アップローダ

**Files:**
- Create: `packages/vite-plugin/src/s3.ts`
- Modify: `packages/vite-plugin/src/index.ts`
- Modify: `packages/vite-plugin/package.json`（@aws-sdk/client-s3 を peer/optional)
- Test: `packages/vite-plugin/test/s3.test.ts`

- [ ] **Step 1: 失敗するテスト（アップロード対象とキー生成のロジックを純粋関数で検証）**

```ts
// test/s3.test.ts
import { describe, it, expect } from 'vitest'
import { buildUploadPlan } from '../src/s3'

describe('buildUploadPlan', () => {
  it('dist の .js を basePath とサフィックス付きのキーへ対応付ける', () => {
    const plan = buildUploadPlan(['foo.js', 'bar.js', 'foo.js.map'], {
      basePath: 'myapp',
      suffix: 'x1y2',
    })
    expect(plan).toContainEqual({ file: 'foo.js', key: 'myapp/foo-x1y2.js' })
    expect(plan).toContainEqual({ file: 'bar.js', key: 'myapp/bar-x1y2.js' })
    // .map も同じサフィックス規則でアップロード対象に含める
    expect(plan).toContainEqual({ file: 'foo.js.map', key: 'myapp/foo-x1y2.js.map' })
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `pnpm --filter @goqoo/vite-plugin test s3`
Expected: FAIL（`buildUploadPlan` 未定義）

- [ ] **Step 3: 純粋ロジックを実装**

```ts
// src/s3.ts
export type S3PlanOptions = { basePath: string; suffix: string }
export type UploadItem = { file: string; key: string }

/** dist 内ファイル名から S3 キーを決める（<base>/<name>-<suffix>.<ext...>） */
export const buildUploadPlan = (files: string[], { basePath, suffix }: S3PlanOptions): UploadItem[] =>
  files.map((file) => {
    const [name, ...rest] = file.split('.')
    const ext = rest.length ? '.' + rest.join('.') : ''
    const key = `${basePath}/${name}-${suffix}${ext}`
    return { file, key }
  })
```

- [ ] **Step 4: テストが通ることを確認**

Run: `pnpm --filter @goqoo/vite-plugin test s3`
Expected: PASS

- [ ] **Step 5: goqooS3 プラグイン本体を追加（closeBundle で実アップロード）**

`src/s3.ts` に追記する。AWS SDK は optional peer とし、未インストール時は分かりやすくエラーにする。

```ts
import type { Plugin } from 'vite'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export type GoqooS3Options = {
  bucket: string
  region: string
  basePath?: string
  suffix?: string
  acl?: string
  outDir?: string
}

export const goqooS3 = (options: GoqooS3Options): Plugin => {
  return {
    name: 'goqoo-s3',
    apply: 'build',
    async closeBundle() {
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3').catch(() => {
        throw new Error('goqooS3 requires @aws-sdk/client-s3. Run: pnpm add -D @aws-sdk/client-s3')
      })
      const outDir = options.outDir ?? 'dist'
      const basePath = options.basePath ?? ''
      const suffix = options.suffix ?? Math.random().toString(36).slice(2, 8)
      const files = readdirSync(outDir).filter((f) => f.endsWith('.js') || f.endsWith('.js.map'))
      const plan = buildUploadPlan(files, { basePath, suffix })
      const client = new S3Client({ region: options.region })
      for (const { file, key } of plan) {
        await client.send(
          new PutObjectCommand({
            Bucket: options.bucket,
            Key: key,
            Body: readFileSync(join(outDir, file)),
            CacheControl: 'private',
            ACL: options.acl as never,
            ContentType: file.endsWith('.map') ? 'application/json' : 'application/javascript',
          })
        )
        // eslint-disable-next-line no-console
        console.info(`uploaded: https://${options.bucket}.s3.${options.region}.amazonaws.com/${key}`)
      }
    },
  }
}
```

- [ ] **Step 6: index.ts に export を追加**

```ts
// src/index.ts
export { goqoo } from './plugin'
export { goqooS3 } from './s3'
export type { GoqooOptions } from './options'
export type { GoqooS3Options } from './s3'
export type { DevInfo } from './devinfo'
```

- [ ] **Step 7: 型チェックとテストが緑か確認**

Run: `pnpm --filter @goqoo/vite-plugin build && pnpm --filter @goqoo/vite-plugin test`
Expected: PASS（`@aws-sdk/client-s3` は optional のため、型のために `pnpm --filter @goqoo/vite-plugin add -D @aws-sdk/client-s3` が必要なら追加する）

- [ ] **Step 8: コミット**

```bash
git add packages/vite-plugin/src packages/vite-plugin/test packages/vite-plugin/package.json pnpm-lock.yaml
git commit -m "feat(vite-plugin): S3アップロード用goqooS3プラグインを追加"
```

---

# Phase D — 仕上げ

### Task D1: README と changeset

**Files:**
- Create: `packages/vite-plugin/README.md`
- Create: `.changeset/initial-vite-plugin.md`

- [ ] **Step 1: パッケージ README を作成（最小）**

````markdown
# @goqoo/vite-plugin

kintone カスタマイズ向けの Vite プラグイン（goqoo v2）。

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { goqoo } from '@goqoo/vite-plugin'

export default defineConfig({
  plugins: [goqoo({ appsDir: 'src/apps' })],
})
```

`src/apps/` 配下の各ファイルを `dist/<name>.js`（自己完結 IIFE・CSS インライン）として出力する。
````

- [ ] **Step 2: changeset を作成（lockstep の初回 2.0.0）**

```markdown
---
"@goqoo/vite-plugin": major
---

goqoo v2: @goqoo/vite-plugin を新規追加（kintone 向け Vite プラグイン）
```

- [ ] **Step 3: 全体テストとビルドが緑か最終確認**

Run: `pnpm -r build && pnpm -r test`
Expected: PASS

- [ ] **Step 4: コミット**

```bash
git add packages/vite-plugin/README.md .changeset/initial-vite-plugin.md
git commit -m "docs(vite-plugin): READMEとchangesetを追加"
```

---

## 完了条件

- `pnpm -r build && pnpm -r test` が緑。
- fixture プロジェクトで `vite build` 相当（結合テスト）が `dist/<name>.js` を自己完結 IIFE + CSS インライン + devinfo banner 付きで出力する。
- dev HMR ブートストラップ配信の**自動テストが緑**、かつ Task B9 Step 8 の**実機検証チェックポイントを実施**（成立しなければフォールバックへ）。
- S3 プラグインのキー生成ロジックがテスト済み。

## 既知の制限 / 後続対応

- **watch モード（`vite build --watch`）は本計画のオーケストレーションでは未対応**。
  コーディネータは noop 入力のみ監視するため、`src/apps/` 変更で再ビルドされない。
  dev は HMR サーバ（`vite`）で代替できるため初回スコープからは外す。後続で
  「`orchestrateBuild` を chokidar 監視で再実行」または「子ビルドを `build.watch` 付きで起動」
  のいずれかで対応する。

## 本計画でやらないこと（後続計画）

- `@goqoo/lib` / `create-goqoo` / メタパッケージ `goqoo` の実装
- 旧 `src/` `dist/` `dts/` 構成の撤去
- `DevInfo` 型の lib への移管（lib 実装後に type-only import へ差し替え）
- `.env`/`envPrefix` の最終調整（[設計書の未確定事項](./2026-05-28-vite-plugin-design.md)）
- watch モードの実装（上記「既知の制限」）
