# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

GoqooはkintoneのJavaScript/CSSカスタマイズ開発を効率化するNode.js CLIフレームワーク。TypeScript、webpack、Babel、React/Vue対応のビルド環境とScaffold機能を提供する。

## 開発コマンド

```bash
# ビルド（TypeScriptをdist/にコンパイル）
yarn build

# 監視モードで開発（ファイル変更時に自動コンパイル）
yarn watch

# テスト実行
yarn test

# dist/ディレクトリのクリーンアップ
yarn cleanup
```

## アーキテクチャ

### ディレクトリ構成

- `src/cli.ts` - CLIエントリーポイント。引数パースとdotenv読み込み後、generator/bundlerにルーティング
- `src/generator/` - プロジェクト・アプリ生成機能（SAOテンプレートベース）
- `src/bundler/` - webpackビルド処理。default/react/vue用の設定ファイルを持つ
- `src/lib/` - ライブラリエクスポート（Goqooクラス、型定義、ユーティリティ）
- `src/_common/` - 共通ユーティリティ（設定読み込み、OAuth処理）
- `dist/` - コンパイル済みJavaScript出力先
- `dts/` - 型定義ファイル

### CLI コマンド体系

**Generator系**（プロジェクト・ファイル生成）:
- `goqoo new` - 新規プロジェクト作成
- `goqoo generate app` - アプリエントリー作成（app/space/portal）
- `goqoo generate customize-view` - React/Vueビュー作成
- `goqoo generate dts` - kintone型定義生成
- `goqoo generate scaffold` - フルスキャフォールド

**Bundler系**（ビルド・開発サーバー）:
- `goqoo build/watch/release/start` - webpack処理

### 設定ファイル

- `goqoo.config.js` - ユーザープロジェクトのGoqoo設定（bundlerが読み込む）
- `webpack.config.*.js` - フレームワーク別webpack設定（default/react/vue）

## コードスタイル

- セミコロンなし
- シングルクォート
- 行幅120文字
- ES5形式のtrailing comma
- TypeScript strict mode

## 言語設定

- コミュニケーションは日本語
- コードコメントは原則日本語
- コンソール出力テキストは状況に応じて英語・日本語を使い分け
