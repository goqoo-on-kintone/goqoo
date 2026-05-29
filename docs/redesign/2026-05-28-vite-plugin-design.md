# @goqoo/vite-plugin 設計書（2026-05-28）

goqoo v2 再設計の第一弾として実装する `@goqoo/vite-plugin` の設計。
全体方針は [README](./README.md) および [session-2026-02-24](./session-2026-02-24.md) を参照。

## 背景と目的

現行 goqoo は webpack ベースの「全部入り」CLI。v2 では以下に分割する（破壊的変更を許容）。

```
@goqoo/create        # scaffold
@goqoo/vite-plugin   # ビルド設定（本設計の対象）
@goqoo/lib           # ランタイムライブラリ（goqoo() / alerts / tools）
goqoo                # 上記を束ねるメタパッケージ
```

本設計は **`@goqoo/vite-plugin` 単体** に閉じる。pnpm monorepo 全体の足場づくりや
`@goqoo/create` / `@goqoo/lib` の実装は別タスクとする。

### 現行 webpack bundler から引き継ぐ本質挙動

- `src/apps/` を走査して各ファイルをエントリ化 → `dist/<name>.js` を出力
- ビルド情報（`COMMIT_HASH` / `BUILT_AT` / `NODE_ENV`）を `window.__devinfo__` に反映
- `.env.[mode]` の読み込み
- dev: HTTPS / CORS 全開 / 固定ポートで安定 URL 配信、`https://localhost:PORT/<name>.js` を出力
- CSS/SCSS を JS 実行時に DOM へ注入（style-loader 相当。kintone には CSS を読む場所が無い）
- release 時の S3 アップロード（オプション）

## 確定した設計判断

| 論点 | 決定 | 理由 |
|---|---|---|
| 責務境界 | **プラグインのみ** 提供。CLI 体験は `@goqoo/create` 生成の `vite.config.ts` + npm scripts で代替 | 最もシンプル・Vite 標準寄り |
| dev ワークフロー | **単一ファイル同期配信 + SSE live-reload**（webpack-dev-server 方式）。当初は Vite dev server + HMR を狙ったが、実機ドッグフーディングで二段ブートストラップの async/競合/クロスオリジン問題が判明し転換 | kintone は単一クラシック script を同期ロードするため。dev/prod が同一成果物になり事故が減る |
| 設定の置き場 | ビルド設定 = `vite.config.ts`（プラグインオプション）／ kintone 接続先（`environments`）= `goqoo.config.js`（**plugin は読まない**、upload ツールが読む） | 関心事の分離 |
| S3 ホスティング | **維持**。ただし core ビルドから分離した**別プラグイン** | core を軽く保つ |
| env 参照 | **Vite ネイティブ（`import.meta.env`）** | v2 クリーンスタート方針と一致 |
| 型チェック | **ユーザーの `tsc` に任せる**（plugin はチェックしない） | Vite 公式推奨・plugin が軽い |

## アーキテクチャ概要

### kintone 制約（出力形式を規定する根本要件）

kintone はアプリのカスタマイズ設定に登録した JS を `<script src>`（クラシック）として
順に挿入する。エントリ間の `import` は解決できず、ESM の共有チャンクも使えない。
したがって **各エントリ = 共有チャンクなしの自己完結 IIFE 1ファイル** が必須。

IIFE は多入力（multi-input）と両立しない（Rollup の制約）ため、自己完結 IIFE を得るには
**エントリ単位のビルド**が事実上唯一の道。

### 「プラグインのみ + 素の `vite build`」と「エントリ単位ビルド」の両立

単一の `vite build` は 1 回のビルドしか走らないため、プラグインが **`vite build` 実行時に
内部で各エントリの sub-build を再帰ガード付きで回す**（プラグインの hook 内で Vite の
`build()` API をエントリ数だけ呼ぶ）。これにより npm script は素の `vite build` のままで、
プラグインだけで完結する。dev も素の `vite`（dev server）で起動するが、Vite のネイティブ ESM 配信は使わず、
`configureServer` が各エントリを「全部入り IIFE」としてメモリにビルドして `/<name>.js` で同期配信する（後述）。

## パッケージ構成

- 配置: `packages/vite-plugin/`（pnpm monorepo、パッケージ名 `@goqoo/vite-plugin`）
- 提供物:
  1. Vite プラグイン `goqoo()`（named export）
  2. S3 アップロード用の別プラグイン `goqooS3()`（named export）
  3. devinfo の型など、`@goqoo/lib` と共有したい型の公開エクスポート
- **スコープ外**: 型チェック、`bundlerType`、generator 系、kintone への upload、`goqoo.config.js` の読み取り

## プラグイン API

```ts
// vite.config.ts（@goqoo/create が生成）
import { defineConfig } from 'vite'
import { goqoo } from '@goqoo/vite-plugin'

export default defineConfig({
  plugins: [
    goqoo({
      appsDir: 'src/apps',   // 既定: 'src/apps'
      devinfo: true,         // 既定: true（window.__devinfo__ 注入）
      injectCss: true,       // 既定: true（CSS を JS にインライン注入）
    }),
    // React/Vue は利用者が @vitejs/plugin-react などを自分で追加
  ],
  // server.https / server.port / server.cors はプラグインが既定値を補完（ユーザー上書き可）
})
```

### オプション

| オプション | 型 | 既定 | 説明 |
|---|---|---|---|
| `appsDir` | `string` | `'src/apps'` | エントリを探索するディレクトリ |
| `devinfo` | `boolean` | `true` | `window.__devinfo__[entryName]` を注入するか |
| `injectCss` | `boolean` | `true` | CSS を JS にインライン注入するか（kintone では実質必須） |

`port` / `https` / `cors` は Vite 標準の `server` / `preview` 設定で扱う。プラグインは未指定時に
kintone 向け既定（https 有効・CORS 全開・固定ポート）を `config` hook で補完する（ユーザー上書き可）。

## 各構成要素の設計

### 1. エントリ探索

`config` / `buildStart` で `appsDir` を走査（dotfile 除外）。`<name>` → 出力 `dist/<name>.js`。
現行 webpack の規約（`src/apps/` 走査・ファイル名がエントリ名）をそのまま踏襲する。

### 2. ビルド出力（build / release）

プラグインの hook で再帰ガード（環境変数フラグ等）を立てつつ、各エントリについて Vite の
`build()` を呼ぶ。各 sub-build の設定:

- `build.lib = { entry, formats: ['iife'], name, fileName: () => '<name>.js' }`
- `build.rollupOptions.output` で共有チャンク無効・ハッシュ無しを保証
- sourcemap 有効
- `mode === 'production'`（release）時のみ minify、それ以外は非 minify

メインの `vite build` 自体は調整役で、成果物は sub-build が `dist/` に出力する。

### 3. CSS インライン

lib mode が分離出力する CSS を JS 側に注入し、style-loader 相当の挙動を維持する
（kintone には CSS を読む場所が無いため必須）。`vite-plugin-css-injected-by-js` を内部利用するか、
同等の軽量 banner を自前実装するかは実装時に小さく決める。

### 4. devinfo 注入と window 契約

- `goqoo()`（`@goqoo/lib`）は **二重実行防止のみ** を担う（`window.__goqoo__[entryName]`）。
- プラグインが各エントリ出力の先頭に banner を注入する:

  ```js
  ;(window.__devinfo__ ||= {})['<entryName>'] = {
    nodeEnv: '…',     // = mode
    commitHash: '…',  // = git rev-parse --short HEAD
    builtAt: '…',     // = ビルド時刻 ISO
  }
  ```

- **契約**: `window.__goqoo__`（lib 所有・二重実行ガード）／ `window.__devinfo__`（plugin 所有・ビルド情報）。
  両パッケージはコード依存を持たず、この window 形状のみで疎結合。**`DevInfo` 型と `window` 拡張は
  `@goqoo/lib` が所有**し、plugin は banner の形を合わせるため `DevInfo` を type-only 参照する
  （詳細は [lib 設計書](./2026-05-28-lib-design.md) を参照）。

### 5. dev server（単一ファイル同期配信 + SSE live-reload）

> **設計転換の経緯**: 当初は「Vite ネイティブ dev server + `@vite/client` を注入する二段ブートストラップ」で
> HMR を狙ったが、実機（kintone）検証で次の問題が連鎖的に判明した:
> ①`https: {}` だと Vite 5+ は証明書を生成せず TLS 失敗、②ブートストラップが `type=module` を注入するため
> **async** になり、同期実行のアップロード済み prod と競合して二重実行ガードに弾かれる、
> ③相対 URL / HTTP2 でポート欠落のクロスオリジン解決ミス。さらに **vanilla(kintone) では Vite の
> module-HMR も結局 full reload** になり、ネイティブ HMR の旨味が無いと判明。
> → webpack-dev-server と同じ「単一クラシック JS を同期配信 + 独自 live-reload」に転換した。

- dev も `vite`（dev server）で起動するが、Vite のモジュール配信は使わない。`@vitejs/plugin-basic-ssl` を
  同梱して https 証明書を自動生成（`goqoo()` は `[basicSsl(), core]` を返す）。
- `configureServer` が起動時に各エントリを **`build({ write:false })` で「全部入り IIFE 文字列」**にバンドルして
  メモリ保持し、`/<name>.js` で**同期配信**する（本番と同一成果物 + devinfo banner + live-reload snippet、非minify）。
- `server.watcher` が `src/` 変更を検知 → 再バンドル → **SSE（`/__goqoo_reload__`）で全クライアントに reload 通知**。
  配信 JS に仕込んだ snippet が `document.currentScript` の origin から SSE に接続し `location.reload()` する。
- これにより kintone に登録する URL は本番と同形（`https://localhost:PORT/<name>.js`）のまま、
  単一ファイル・同期・クロスオリジン安全・dev でも devinfo あり・保存で全画面リロード。

**実機検証（実装後に実施し、成立を確認済み）**:
- localhost の HTTPS 証明書（自己署名 or mkcert）
- 混在コンテンツ（mixed content）回避
- kintone の CSP
- クロスオリジン CORS

### 6. 環境変数

- Vite ネイティブ `import.meta.env`。`.env.[mode]` をネイティブ対応。
- `envPrefix` を調整し goqoo 用途の変数を露出（`VITE_` 必須を緩和。最終プレフィックスは実装時確定）。
- ユーザーは `process.env.X` → `import.meta.env.X` に移行する（破壊的変更）。

### 7. S3 アップロード（別プラグイン）

- `goqooS3()` を別 export として提供。`closeBundle` で `dist/*.js` を S3 へアップロード。
- 現行同様: ランダムサフィックス・basePath・ACL 環境変数対応・アップロード先 URL の出力。
- core ビルドからは独立。利用者は `vite.config.ts` の plugins に任意で追加する。

## create-goqoo が生成する npm scripts（整合確認のため記載）

`create-goqoo`（scaffold）側の実装範囲だが、本プラグインの前提として整合を確認しておく。
詳細は [create 設計書](./2026-05-28-create-design.md) を参照。

```jsonc
{
  "dev":       "vite",                          // = goqoo start 相当（単一ファイル配信 + SSE live-reload）
  "build":     "vite build",                    // dev ビルド（mode=development）
  "release":   "vite build --mode production",
  "watch":     "vite build --watch",
  "typecheck": "tsc --noEmit"                   // 型チェックは別
}
```

## テスト方針

- **単体（Vitest）**: エントリ探索 / banner 生成 / オプション正規化 / config 補完
- **結合**: 一時 fixture プロジェクトに対し `build()` を回し、`dist/<name>.js` が
  1. 単一ファイル
  2. 共有チャンク無し
  3. IIFE で実行可能
  4. `window.__devinfo__` を設定
  5. CSS が JS に含まれる
  を満たすことを検証
- **dev 配信**: `buildReloadSnippet` の単体テスト + 実機（curl / kintone）での単一ファイル配信・SSE reload 確認

## 主なリスク / 未確定事項

- dev は webpack-dev-server 方式（単一ファイル同期配信 + SSE）に確定。実機で TLS / 同期実行 / SSE reload を確認済み。
  自己署名証明書はブラウザで一度許可が必要（運用上の注意）。
- `envPrefix` の最終値 → 実装時に確定。
- CSS インラインを既存プラグイン利用とするか自前実装とするか → 実装時に小さく確定。
