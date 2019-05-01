# Goqoo on kintone

[English](/README.md) | [日本語](/README.ja.md)

Goqoo is a framework for [kintone](https://www.kintone.com/) [Javascript/CSS customization development](https://developer.kintone.io/hc/en-us/articles/115003211808) on Node.js.

Supports ES6 transpiling, bundling with Babel/Webpack, local preview with Webpack DevServer, deployment using S3/Dropbox, simple Vue templates, etc.

## Install requried libraries

Goqoo requires Node.js and Yarn. Install both according to the documents below.

https://nodejs.org/  
https://yarnpkg.com/lang/en/docs/install

## Install Goqoo

```sh
$ npm install -g goqoo
 or
$ yarn global add goqoo
```

## Mini-tutorial

```sh
$ goqoo new project1
```
Goqoo creates `project1` directory in the current directory, installs required libraries and files.


```sh
$ cd project1
```
Moves to the new directory.

Write down the ID of the kintone app which you want to customize (i.g. 1).

```sh
$ goqoo generate scaffold app1:1
```
Goqoo asks you for kintone login information, so you should answer these questions.

```sh
? Enter your kintone domain <subdomain.cybozu.com>
? Enter your kintone username <username>
? Enter your kintone password <password>
```
Goqoo creates `app1` entry into the `apps` directory in the project, installs template files, and login to kintone through REST API and sets customization info of the app which ID is 1.

```sh
$ yarn start
```
Goqoo builds JavaScripts files under `apps` directory, starts up local dev server and hosts the bundle file. You can open the kintone app on web browser and see the customized list view added by Goqoo.

Then, you can edit the customization file. Open `'./apps/app1/customize.js'` with your text editor.

```js
  swal({
    text: 'Hello, Goqoo on kintone!',
    icon: img,
  })
    ...
```
Edit `'Hello, Goqoo on kintone'` as you like. Save the file and you'll see that Goqoo automatically rebuilds JS files. Reload the web browser and you can find the message has been changed successfully!

## Commands

### Create new project

```sh
$ goqoo new <project_name>
```
Creates new `<project_name>` directory in the current directory, sets the project name to `<project_name>` and installs required library and files. 

### Initialize project

```sh
$ goqoo init
```
Sets the project name to current directory name, installs required library and files.

```sh
$ goqoo new <project_name>
# above command equals to the commands below
$ mkdir <project_name>
$ cd <project_name>
$ goqoo init
```

### Generate new app entry (with entry point file only)

```sh
# run in the project root directory
$ goqoo generate app <app_name>
```
Creates new `<app_name>` app entry and installs entry point file for JavaScript customization.

### Generate new app entry (with entry point and template files)

```sh
# run in project directory
$ goqoo generate scaffold <app_name>:<app_id>
```
Creates new `<app_name>` app entry and installs entry point file and template files for JavaScript customization. Then asks you for kintone login information, login to kintone though REST API, and sets the kintone app's JavaScript customization URL to the hosting URL on local dev server.

# Licence

MIT
