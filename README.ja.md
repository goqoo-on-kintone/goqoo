# Goqoo on kintone

[English](/README.md) | [日本語](/README.ja.md)

Goqooは [kintone](https://kintone.cybozu.co.jp/) の [JavaScript/CSSカスタマイズ](https://developer.cybozu.io/hc/ja/articles/200730174-JavaScript%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%9Fkintone%E3%81%AE%E3%82%AB%E3%82%B9%E3%82%BF%E3%83%9E%E3%82%A4%E3%82%BA)を支援するフレームワークです。Node.js環境下で動作します。

webpackやBabelによるES6スクリプトのトランスパイルやJS/CSSファイルのバンドル、webpack-dev-serverによるカスタマイズのプレビュー、S3/Dropboxによるカスタマイズファイルの配備、簡易的なVue.jsテンプレートなどの機能を含みます。

## 必須ライブラリのインストール

Goqooのインストールや実行にはNode.js、Yarnが必須です。下記のドキュメントにしたがってってインストールしてください。

https://nodejs.org/ja/  
https://yarnpkg.com/lang/ja/docs/install

## Goqooのインストール

```sh
$ npm install -g goqoo
 or
$ yarn global add goqoo
```

## ミニ・チュートリアル

```sh
$ goqoo new project1
```
Goqooはカレントディレクトリに `project1` ディレクトリを作成し、Goqooの実行に必要なライブラリやファイルをインストールします。

```sh
$ cd project1
```
作成されたディレクトリに移動します。

カスタマイズしたいkintoneアプリのIDをメモしておきます（例：1）。

```sh
$ goqoo generate scaffold app1:1
```
上記のコマンドを入力すると、Goqooからkintoneログイン情報の入力を求められますので、入力します。

```sh
? Enter your kintone domain <subdomain.cybozu.com>
? Enter your kintone username <username>
? Enter your kintone password <password>
```
Goqooはプロジェクト内の `apps` ディレクトリに `app1` エントリを作成し、kintoneカスタマイズのテンプレートファイルを展開します。また、入力したログイン情報を使用してREST API経由でkintone環境にログイン、ID=1のkintoneアプリにカスタマイズ情報を設定します。

```sh
$ yarn start
```
Goqooは `apps` ディレクトリ内のJavaScriptファイルをビルド、ローカル開発サーバを起動してバンドルファイルをホストします。Webブラウザでkintoneアプリを開くと、「カスタマイズビュー」一覧が自動的に追加されており、ローカル開発サーバにホストされたJSカスタマイズが反映されていることを確認できます。

次に、カスタマイズファイルを編集してみましょう。`./apps/app1/customize.js` をテキストエディターで開きます。

```js
  swal({
    text: 'Hello, Goqoo on kintone!',
    icon: img,
  })
    ...
```
`'Hello, Goqoo on kintone'` を適当に書き換えてみましょう。ファイルを保存すると、自動的にビルドが再実行されます。Webブラウザをリロードし、表示されるメッセージの文言が変更されていることを確認してください。

## コマンド

### プロジェクトの新規作成

```sh
$ goqoo new <project_name>
```
カレントディレクトリにディレクトリ `<project_name>` を作成し、プロジェクト名を `<project_name>` に設定して、Goqooの実行に必要なライブラリやファイルをインストールします。

### プロジェクトの初期化

```sh
$ goqoo init
```
カレントディレクトリ名をプロジェクト名として設定し、Goqooの実行に必要なライブラリやファイルをインストールします。

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
新規アプリエントリ `<app_name>` を作成し、JavaScriptカスタマイズのエントリポイントファイルを配置します。

### アプリエントリの新規作成（エントリポイントとテンプレートファイルを作成）

```sh
# プロジェクトのルートディレクトリで実行
$ goqoo generate scaffold <app_name>:<app_id>
```
新規アプリエントリ `<app_name>` を作成し、JavaScriptカスタマイズのエントリポイントとテンプレートファイルを配置します。また、kintoneログイン情報の入力を要求し、入力された情報にしたがってREST API経由でkintoneにログイン、ローカル開発サーバがバンドルファイルをホスティングするURLをアプリ（ID = 1）のJavaScriptカスタマイズURLとして設定します。

## ライセンス

MIT
