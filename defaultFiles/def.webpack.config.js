/* eslint-disable no-console */
const path = require('path')
const rcfile = require('rc-config-loader')
require('dotenv').config({ path: path.resolve('config/.env') })
const DropboxKintone = require('./.goqoo/dropbox')

const { npm_package_name: projectName } = process.env
const { apps, useDropbox } = rcfile('goqoo', { configFileName: `${__dirname}/config/goqoo.config` }).config

const entry = apps.reduce((obj, file) => {
  obj[file] = ['babel-polyfill', `${__dirname}/apps/${file}/${file}`]
  return obj
}, {})

const output = { path: path.resolve('dist') }
if (useDropbox) {
  const dropbox = {
    rootDir: process.env.DROPBOX_ROOT,
    subDir: process.env.DROPBOX_KINTONE_DIR,
    token: process.env.DROPBOX_TOKEN,
  }

  if (!dropbox || !dropbox.rootDir) {
    console.error('DROPBOX_ROOT: environment variable not found!')
    process.exit(1)
  }

  const outputDir = `${dropbox.subDir || ''}/${projectName}`
  output.path = path.resolve(path.join(dropbox.rootDir, outputDir))

  if (dropbox.token) {
    const dbxKintone = new DropboxKintone({
      accessToken: dropbox.token,
      localRootDir: dropbox.rootDir,
    })
    const dbxOutputPaths = apps.map(file => `/${outputDir}/${file}.js`)
    dbxKintone.fetchSharedLinks(dbxOutputPaths).then(paths => {
      console.log(JSON.stringify(paths, null, '  '))
    })
  }
}

module.exports = {
  entry,
  output,
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: [
            [
              'env',
              {
                targets: { browsers: ['last 2 versions'] },
                modules: false,
              },
            ],
          ],
          plugins: ['transform-class-properties'],
        },
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.css$/,
        loader: ['style-loader/useable', 'css-loader'],
      },
      {
        test: /\.scss$/,
        loader: ['style-loader/useable', 'css-loader', 'sass-loader'],
      },
      {
        test: path.join(__dirname, 'node_modules/kintone-utility/docs/kintoneUtility'),
        loader: 'exports-loader?kintoneUtility',
      },
    ],
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js',
    },
  },
}
