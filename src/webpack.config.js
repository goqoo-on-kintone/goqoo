/* eslint-disable no-console */
// const webpack = require('webpack')
const path = require('path')
const { rcFile } = require('rc-config-loader')
require('dotenv').config()
// const S3Plugin = require('webpack-s3-plugin')

const { apps } = rcFile('goqoo', { configFileName: path.resolve('config', 'goqoo.config') }).config

const entry = apps.reduce((obj, appName) => {
  obj[appName] = ['babel-polyfill', path.resolve('src', 'apps', appName)]
  return obj
}, {})

const config = {
  entry,
  output: { path: path.resolve('dist') },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: { browsers: ['last 2 versions'] },
                modules: false,
              },
            ],
          ],
          plugins: [['@babel/proposal-class-properties', { loose: false }]],
        },
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
      {
        test: /\.(scss)$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'sass-loader' }],
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
      },
    ],
  },
  resolve: {
    // alias: {
    //   vue$: 'vue/dist/vue.esm.js',
    // },
  },
  plugins: [
    // new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    contentBase: path.resolve('dist'),
    inline: true,
    // hot: true,
    https: true,
    port: 59000,
    headers: { 'Access-Control-Allow-Origin': '*' },
    disableHostCheck: true,
    progress: true,
  },
}

// if (process.env.S3) {
// const { npm_package_name: projectName } = process.env
//   config.entry = Object.entries(config.entry).reduce((obj, [key, value]) => {
//     obj[`${key}-${process.env.AWS_RANDOM_SUFFIX}`] = value
//     return obj
//   }, {})
//   ;['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_REGION', 'AWS_S3_BUCKET'].forEach((variable) => {
//     if (!process.env[variable]) {
//       console.error(`${variable}: environment variable not found!`)
//       process.exit(1)
//     }
//   })

//   config.plugins.push(
//     new S3Plugin({
//       // Exclude uploading of html
//       exclude: /.*\.html$/,
//       // s3Options are required
//       s3Options: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//         region: process.env.AWS_S3_REGION,
//       },
//       s3UploadOptions: {
//         Bucket: process.env.AWS_S3_BUCKET,
//       },
//       basePath: process.env.AWS_S3_BASEPATH || projectName,
//     })
//   )
// }

module.exports = config
