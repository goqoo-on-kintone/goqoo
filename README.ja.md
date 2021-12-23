# Goqoo on kintone

[English](/README.md) | [日本語](/README.ja.md)

Goqooは[kintone](https://kintone.cybozu.co.jp/)の[JavaScript/CSSカスタマイズ](https://developer.cybozu.io/hc/ja/articles/210064823)を支援するフレームワークです。Node.js環境下で動作します。

webpackやBabelによるTypeScriptのトランスパイルやJS/CSSファイルのバンドル、webpack-dev-serverによるカスタマイズのプレビュー、AWS S3によるカスタマイズファイルの配備、簡易的なReact/Vue.jsテンプレートなどの機能を含みます。

## Getting Started

```sh
$ npx goqoo new my-project
# プロンプトの選択肢はすべてデフォルトのままでEnter
? Project name › my-project
? Project description › 
? Frontend Framework … 
❯ (None)
  React
  Vue
```
Goqooはカレントディレクトリに `my-project` ディレクトリを作成し、Goqooの実行に必要なライブラリやファイルをインストールします。

作成されたディレクトリに移動して、一度gitコミットをしておきます。
```sh
$ cd my-project
$ git add .
$ git commit -m 'Initial commit'
```

```sh
$ npx goqoo generate app my-app
```
Goqooはプロジェクト内の `src/apps` ディレクトリに `my-app` エントリを作成し、kintoneカスタマイズのテンプレートファイルを展開します。

```sh
$ npx goqoo start

{ bundlerType: 'default', nodeEnv: 'development' }
{ mode: 'development' }
{ env: { WEBPACK_SERVE: true } }
{ 'my-app': 'https://localhost:59000/my-app.js' }
```
Goqooは `src/apps` ディレクトリ内のJavaScriptファイルをビルド、ローカル開発サーバを起動してバンドルファイルをホストします。

コンソールに表示された`my-app`のURLを、kintoneアプリのJavaScriptカスタマイズURLとして設定します。
「Hello, Goqoo on kintone!」とアラートが表示されれば、デプロイ成功です。

<img src="/img/hello-goqoo.png" width="320px"></img>

## コマンド

### プロジェクトの新規作成

```sh
$ goqoo new <project-name>
```
カレントディレクトリにディレクトリ `<project-name>` を作成し、プロジェクト名を `<project-name>` に設定して、Goqooの実行に必要なライブラリやファイルをインストールします。
`<project-name>`を省略した場合はカレントディレクトリをプロジェクト名とします。

### アプリエントリの新規作成

```sh
# プロジェクトのルートディレクトリで実行
$ goqoo generate app <app-name>
```
新規アプリエントリ `<app-name>` を作成し、JavaScriptカスタマイズのエントリポイントファイルを配置します。

### カスタマイズビューの新規作成(React/Vue.js利用時)

```sh
# プロジェクトのルートディレクトリで実行
$ goqoo generate customize-view <exists-app-name> <customize-view-name>
```
既存アプリエントリ `src/apps/<exists-app-name>` 内に、カスタマイズビューのTS/CSS/HTMLファイルを作成します。

### kintoneアプリの型定義ファイルを作成

```sh
$ goqoo generate dts
```
既存アプリエントリ `src/apps/<exists-app-name>` 内に、カスタマイズビューのTS/CSS/HTMLファイルを作成します。
`goqoo.config.js`内にアプリIDを列挙して、`.env`にkintoneのログイン情報を設定しておく必要があります。

## ライセンス

MIT
