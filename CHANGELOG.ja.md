# Changelog

## [1.3.1] - 2026-05-28

### Bug Fixes

- **preinstallでのtypesync自動実行を削除** - `typesync || true` がインストール時に走らないようにし、Windowsでも問題なくインストールできるように

---

## [1.3.0] - 2025-02-24

v1.2.0 (2023-04-03) からの変更点

### Features

#### 認証機能の拡張
- **APIトークン認証に対応** - パスワード認証に加えてAPIトークンでの認証をサポート
- **認証まわりのプロパティ構成を変更** - Auth型の設計見直し
- **Auth型をexport** - ライブラリとして利用する際に型を参照可能に

#### dts生成の改善
- **generate dts時に.env.developmentなどを読み取り** - 環境別の設定ファイル対応
- **dtsファイルの生成は直列実行でエラー時のログもわかりやすく** - 並列実行時の問題回避とデバッグ改善

#### ビルド・開発環境
- **Dart Sassでビルドできるように** - Node Sassから移行、モダンなSass環境をサポート
- **dev-serverのポートを指定可能に** - 複数プロジェクト同時開発時のポート競合を回避
- **ビルドタイミングが異なる複数JSを1アプリに適用しても__devinfo__が動くように** - 開発時のデバッグ情報表示改善

#### AWS S3デプロイ
- **S3 セッショントークンに対応** - AWS STSによる一時認証情報でのデプロイをサポート
- **ACLオフでも正しく動くように** - S3バケットのACL無効化環境への対応

#### エラーハンドリング
- **KintoneAllRecordsErrorのmessageが正しく表示されるように** - 一括取得エラー時のメッセージ改善

### Internal Changes

- Node SassからDart Sassに移行
- sass-loaderからfibersを削除（Dart Sass不要）
- @kintone/dts-genを最新版に更新
- minimist-optionsを導入してCLI引数パース改善

---

## [1.2.0] - 2023-04-03

### Features

- OAuth対応
- OAuth時のproxy認証、クライアント証明書認証に対応

---

## [1.1.0] - 2022-01-13

- テンプレートのアップグレード

---

## [1.0.0] - 2021-12-23

### Features

#### ビルド・開発環境
- TypeScriptのビルドに対応
- React/Vueのビルドに対応
- dev-server起動時にURLをコンソール表示
- source-mapがdevtoolで使えるように
- NODE_ENV環境変数に応じて.env.developmentなどを読み込み

#### S3デプロイ
- S3アップロードを有効化
- S3アップロード後のURLをビルド時に表示

#### dts生成
- goqoo generate dtsが動くように
- skip機能を追加

#### ライブラリ機能
- devinfoが出せるように
- dev-serverとS3など複数JSを同時適用した際は2本目以降をスキップ
- getQueryOrder関数をlibに実装
- sweetalertのカスタマイズ追加

#### Generator
- standard, react, vueを選択可能に
- in-appジェネレータの種別を新設
- サブジェネレータを作る仕組みを追加
- ジェネレータはsaoに変更

---

## [0.3.0] - 2019-05-23

- ドキュメントの充実化

---

## [0.2.0] - 2018-10-15

### Features

- newとgenerateはyeomanを間接的に呼び出す仕様に変更
- `goqoo new`のログを全ファイル分綺麗に出力
- `goqoo new`のファイル上書き警告対応
- `goqoo new`に`skip-yarn`オプションを追加
- `goqoo new .`でカレントをGoqooプロジェクト化できるように

---

## [0.1.0] - 2018-06-11

### Features

- CLIの基本機能（goqoo new, generate）
- webpack設定
- ESLint, Prettier設定
- generate scaffold実装
- Dropbox公開リンク自動生成
