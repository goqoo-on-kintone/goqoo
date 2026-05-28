# create-goqoo 設計書（2026-05-28）

goqoo v2 再設計の第三弾。scaffold パッケージ `create-goqoo`（現 `goqoo new`）の設計。
全体方針は [README](./README.md)、関連設計は
[vite-plugin 設計書](./2026-05-28-vite-plugin-design.md) /
[lib 設計書](./2026-05-28-lib-design.md) を参照。

## 背景と目的

現行の SAO ベース `goqoo new` を独立パッケージとして再構成し、
別リポジトリ `@goqoo/templates` を統合する。コード生成（`g app` 等）は廃止し、
**AI がコードを生成できるようコンテキスト（CLAUDE.md）を提供する**方針へ役割転換する。

### 現行 goqoo new の構成

- SAO ベース。テンプレートは別リポジトリ `@goqoo/templates` の `templates/{default,react,vue}`
- プロンプト: name / description / frontendFramework（None/React/Vue）
- アクション: フレームワーク別テンプレをコピー → gitignore リネーム → package.json 書き換え
- 完了時: `gitInit` / `npmInstall` / `showProjectTips`

## 確定した設計判断

| 論点 | 決定 | 理由 |
|---|---|---|
| パッケージ名 / 起動 | **`create-goqoo`** / `npm create goqoo` | UX 良。dir は `packages/create/`、メタパッケージ `goqoo` が依存 |
| scaffold ツール | **@clack/prompts + 素のファイルコピー**（create-vite 風、SAO 廃止） | 軽量・制御性・UX |
| フレームワーク | **React/Vue はテンプレに含めない**（プロンプト廃止。必要なら利用者が自己責任で追加） | plugin 設計と整合・大幅簡素化 |
| テンプレート構成 | **単一ベース + ツールオーバーレイ合成** | 組合せ爆発を避ける |
| ツール連携 | **深い配線**（各ツールの設定ファイルも生成） | 初期 UX を滑らかに（各ツール仕様への結合は許容） |
| generator 系 | **廃止**（`g app` / `g customize-view` / `g dts`） | AI 代替 / trunks と重複 |

> docs では `@goqoo/create` 表記だったが、`npm create goqoo` の UX を優先し **`create-goqoo`** に変更。
> メタパッケージ `goqoo` の依存も `@goqoo/create` → `create-goqoo` に読み替える。

## パッケージ / 起動

- 配置: `packages/create/`、名称 **`create-goqoo`**
- テンプレート同梱: `packages/create/templates/`（別リポジトリ `@goqoo/templates` は廃止・統合）
- 起動: 主経路 `npm create goqoo@latest <dir>`。加えてメタパッケージ `goqoo` 経由の `goqoo new` でも委譲起動

## プロンプト（@clack/prompts）

- Project name
- Project description
- ginue を使う？（Y/n）
- gyuma を使う？（Y/n）
- trunks を使う？（Y/n）

※ Frontend Framework プロンプトは廃止。

## テンプレート構成（ベース + オーバーレイ合成）

**単一ベーステンプレート**（素の TypeScript kintone プロジェクト）を軸に、選択ツールの
オーバーレイを加算合成する。`package.json` / `CLAUDE.md` はマージで生成する。

## 生成物（ベース）

- `package.json`
  - deps: `vite` / `@goqoo/vite-plugin` / `@goqoo/lib`
  - devDeps: `typescript` / `@kintone/customize-uploader`（+ 選択ツール）
  - scripts:
    ```jsonc
    {
      "dev":       "vite",
      "build":     "vite build",
      "release":   "vite build --mode production",
      "watch":     "vite build --watch",
      "typecheck": "tsc --noEmit",
      "upload":    "<パスワード認証版 / OAuth 認証版を用意>"
    }
    ```
- `vite.config.ts`: `goqoo()` プラグインを差した最小構成（フレームワークプラグインは含めない）
- `tsconfig.json`
- `src/apps/sample.ts`: `goqoo()` 利用サンプル
- `.env` / `.env.development` などのサンプル
- `goqoo.config.js`: kintone 接続先（`environments`: env / host / appId / auth）。lib の簡素化 `Config` 型に準拠。**plugin は読まず upload ツールが読む**
- `customize-manifest.json`: customize-uploader 用テンプレート
- `CLAUDE.md`: AI コンテキスト（後述）
- `.gitignore` / `README`

### upload script

- **パスワード認証版** と **OAuth 認証版**（gyuma 利用）を用意し、コメントで切替できるようにする。
- OAuth 版イメージ:
  ```bash
  KINTONE_OAUTH_TOKEN=$(gyuma --domain xxx.cybozu.com \
    --scope k:app_settings:read k:app_settings:write k:file:write) \
  kintone-customize-uploader customize-manifest.json
  ```

### CLAUDE.md の内容

- プロジェクト構造（`src/apps/` 配下の規約）
- `goqoo()` の使い方と意図（二重実行防止）
- kintone イベントの書き方パターン
- `@goqoo/lib` のダイアログ API の使い方
- **アップロード手順**（パスワード / OAuth）

## ツール選択時の配線（深い配線）

- **gyuma**: devDep 追加 + OAuth 版 upload script を有効化 + CLAUDE.md 追記
- **trunks**: devDep 追加 + dts 生成 npm script + trunks 設定ファイル生成 + CLAUDE.md 追記
- **ginue**: devDep 追加 + `.ginuerc` 等の設定ファイル生成 + ginue 用 npm script + CLAUDE.md 追記

> ⚠️ 各ツールの設定スキーマ / バージョンに結合するため、実装時に各ツールの最新仕様で確認する。

## 完了処理

1. `git init`
2. 依存インストール（pnpm / npm を検出）
3. 次の一手（`dev` 起動・`upload` 手順）を表示

## テスト方針

- プロンプト分岐（ツール選択の有無）でのファイル生成内容の検証
- `package.json` / `CLAUDE.md` のマージ結果の検証
- 生成プロジェクトが `vite build` で正しく `dist/<name>.js` を出すスモークテスト（vite-plugin との結合）

## 他設計への影響（整合）

- plugin 設計の「React/Vue は利用者が自分で追加」を create が追認（フレームワークプロンプト廃止）。**矛盾なし、むしろ簡素化**。
- create が生成する npm scripts は plugin 設計の想定（`dev`=vite / `build`=vite build …）と一致。
- `goqoo.config.js` の shape は lib の簡素化 `Config` 型に準拠。
- **命名変更**: `@goqoo/create` → `create-goqoo`。docs のメタパッケージ節（`@goqoo/create` 依存）は `create-goqoo` に読み替える。

## 主なリスク / 未確定事項

- 各ツール（ginue/gyuma/trunks）の設定ファイル仕様への結合 → 実装時に最新仕様で確認。
- `goqoo.config.js` 型の最終形（`nodeEnv` を残すか、Vite の mode に寄せるか）→ lib `Config` と合わせて確定。
- メタパッケージ `goqoo` の `goqoo new` 委譲の実装方式（bin 委譲）→ メタパッケージ設計時に確定。
