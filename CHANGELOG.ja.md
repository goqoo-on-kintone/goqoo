# Changelog

## [1.3.0] - Unreleased (beta017)

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

（以前のリリース）
