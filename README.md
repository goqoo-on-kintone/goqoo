# Goqoo on kintone

[English](/README.md) | [日本語](/README.ja.md)

Goqoo is a framework for [kintone](https://www.kintone.com/) [JavaScript/CSS customization](https://developer.kintone.io/hc/en-us/articles/212495178). It works on Node.js.

Supports TypeScript transpiling, bundling with Babel/webpack, local preview with webpack DevServer, deployment using AWS S3, simple React/Vue.js templates, etc.

## Getting Started

```sh
$ npx goqoo new my-project
# Leave all prompt choices at their defaults and Enter
? Project name › my-project
? Project description › 
? Frontend Framework … 
❯ (None)
  React
  Vue
```
Goqoo creates `my-project` directory in the current directory, installs required libraries and files.

Moves to the new directory and make a git commit once.
```sh
$ cd my-project
$ git add .
$ git commit -m 'Initial commit'
```

```sh
$ goqoo generate app my-app
```
Goqoo creates `my-app` entry into the `src/apps` directory in the project, installs template files.

```sh
$ npx goqoo start

{ bundlerType: 'default', nodeEnv: 'development' }
{ mode: 'development' }
{ env: { WEBPACK_SERVE: true } }
{ 'my-app': 'https://localhost:59000/my-app.js' }
```
Goqoo builds JavaScripts files under `src/apps` directory, starts up local dev server and hosts the bundle file.

Set the URL of `my-app` displayed in the console as the JavaScript customization URL of your kintone app.
If you see the alert "Hello, Goqoo on kintone!", the deployment is successful.

<img src="/img/hello-goqoo.png" width="320px"></img>

## Commands

### Create new project

```sh
$ goqoo new <project-name>
```
Creates new `<project-name>` directory in the current directory, sets the project name to `<project-name>` and installs required library and files. 
If `<project-name>` is omitted, the current directory is used as the project name.

### Generate new app entry

```sh
# run in the project root directory
$ goqoo generate app <app-name>
```
Generates new `<app-name>` app entry and installs entry point file for JavaScript customization.

### Generate new customize-view in exists app entry(when using React/Vue.js)

```sh
# run in the project root directory
$ goqoo generate customize-view <exists-app-name> <customize-view-name>
```
Generates new customize-view TS/CSS/HTML files in exists app entry `src/apps/<exists-app-name>`.

### Generate kintone apps type definition files

```sh
$ goqoo generate dts
```
既存アプリエントリ `src/apps/<exists-app-name>` 内に、カスタマイズビューのTS/CSS/HTMLファイルを作成します。
You need to enumerate app ids in `goqoo.config.js` and set the kintone login information in `.env`.

# Licence

MIT
