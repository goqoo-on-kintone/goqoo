# Goqoo on kintone

[English](/README.md) | [日本語](/README.ja.md)

Goqoo は [kintone](https://kintone.cybozu.co.jp/) の [JavaScript/CSSカスタマイズ](https://developer.cybozu.io/hc/ja/articles/200730174-JavaScript%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%9Fkintone%E3%81%AE%E3%82%AB%E3%82%B9%E3%82%BF%E3%83%9E%E3%82%A4%E3%82%BA)を支援するフレームワークです。Node.js 環境下で動作します。

webpack や Babel による ES6 スクリプトのトランスパイルや JS/CSS ファイルのバンドル、webpack-dev-serverによるカスタマイズのプレビュー、S3/Dropbox によるカスタマイズファイルの配備、簡易的な Vue.js テンプレートなどの機能を含みます。

## 必須ライブラリのインストール

Goqoo のインストールや実行には Node.js、Yarn が必須です。下記のドキュメントに従ってインストールしてください。

https://nodejs.org/ja/  
https://yarnpkg.com/lang/ja/docs/install

## Goqoo のインストール

```sh
$ npm install -g goqoo
 or
$ yarn global add goqoo
```

## ミニ・チュートリアル

```sh
$ goqoo new project1
```
Goqoo はカレントディレクトリに `project1` ディレクトリを作成し、Goqoo の実行に必要なライブラリやファイルをインストールします。

```sh
$ cd project1
```
作成されたディレクトリに移動します。

カスタマイズしたい kintone アプリのID をメモしておきます（例：1）。

```sh
$ goqoo generate scaffold app1:1
```
上記のコマンドを入力すると、Goqoo から kintone ログイン情報の入力を求められますので、入力します。

```sh
? Enter your kintone domain <subdomain.cybozu.com>
? Enter your kintone username <username>
? Enter your kintone password <password>
```
Goqoo はプロジェクト内の `apps` ディレクトリに `app1` エントリを作成し、kintone カスタマイズのテンプレートファイルを展開します。また、入力したログイン情報を使用して REST API 経由で kintone 環境にログイン、ID=1 の kintone アプリにカスタマイズ情報を設定します。

```sh
$ yarn start
```
Goqoo は `apps` ディレクトリ内の JavaScript ファイルをビルド、ローカル開発サーバを起動してバンドルファイルをホストします。Web ブラウザで kintone アプリを開くと、「カスタマイズビュー」一覧が自動的に追加されており、ローカル開発サーバにホストされた JS カスタマイズが反映されていることを確認できます。

次に、カスタマイズファイルを編集してみましょう。`./apps/app1/customize.js` をテキストエディタで開きます。

```js
  swal({
    text: 'Hello, Goqoo on kintone!',
    icon: img,
  })
    ...
```
`'Hello, Goqoo on kintone'` を適当に書き換えてみましょう。ファイルを保存すると、自動的にビルドが再実行されます。Web ブラウザをリロードし、表示されるメッセージの文言が変更されていることを確認してください。

## コマンド

### プロジェクトの新規作成

```sh
$ goqoo new <project_name>
```
カレントディレクトリにディレクトリ `<project_name>` を作成し、プロジェクト名を `<project_name>` に設定して、Goqoo の実行に必要なライブラリやファイルをインストールします。

### プロジェクトの初期化

```sh
$ goqoo init
```
カレントディレクトリ名をプロジェクト名として設定し、Goqoo の実行に必要なライブラリやファイルをインストールします。

```sh
$ goqoo new <project_name>
# 上記のコマンドは下記のコマンドと等価です。
$ mkdir <project_name>
$ cd <project_name>
$ goqoo init
```

### アプリエントリの新規作成（エントリポイントファイルのみ作成）

```sh
# プロジェクトのルートディレクトリで実行
$ goqoo generate app <app_name>
```
新規アプリエントリ `<app_name>` を作成し、JavaScript カスタマイズのエントリポイントファイルを配置します。

### アプリエントリの新規作成（エントリポイントとテンプレートファイルを作成）

```sh
# プロジェクトのルートディレクトリで実行
$ goqoo generate scaffold <app_name>:<app_id>
```
新規アプリエントリ `<app_name>` を作成し、JavaScript カスタマイズのエントリポイントとテンプレートファイルを配置します。また、kintone ログイン情報の入力を要求し、入力された情報に従って REST API 経由で kintone にログイン、ローカル開発サーバがバンドルファイルをホスティングする URL をアプリ（ID = 1）の JavaScript カスタマイズURL として設定します。

## ライセンス

MIT
