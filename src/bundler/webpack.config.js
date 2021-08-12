/* eslint-disable no-console */
const path = require('path')
const fs = require('fs')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const S3Plugin = require('webpack-s3-plugin')
const merge = require('webpack-merge')
const { projectPath } = require('../utils')
const { babelOptions, babelOptionsTs } = require('./babel-options')
require('dotenv').config()

const basePath = path.resolve('src')
const appsPath = path.join(basePath, 'apps')
const entry = fs
  .readdirSync(appsPath)
  .filter((file) => !/^\./.test(file)) // Exclude dotfiles
  .reduce(
    (prev, file) => ({
      ...prev,
      [path.parse(file).name]: path.resolve(appsPath, file),
    }),
    {}
  )

const config = {
  entry,
  output: { path: path.resolve('dist') },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: require.resolve('babel-loader'),
        exclude: /node_modules/,
        options: babelOptions,
      },
      {
        test: /\.ts$/,
        loader: require.resolve('babel-loader'),
        exclude: /node_modules/,
        options: babelOptionsTs,
      },
      {
        test: /\.css$/,
        use: [{ loader: require.resolve('style-loader') }, { loader: require.resolve('css-loader') }],
      },
      {
        test: /\.(scss)$/,
        use: [
          { loader: require.resolve('style-loader') },
          { loader: require.resolve('css-loader') },
          { loader: require.resolve('sass-loader') },
        ],
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: require.resolve('url-loader'),
      },
    ],
  },
  resolve: {
    modules: [basePath, 'node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: projectPath('tsconfig.json'),
      },
    }),
  ],
  devServer: {
    contentBase: path.resolve('dist'),
    inline: true,
    https: true,
    port: 59000,
    headers: { 'Access-Control-Allow-Origin': '*' },
    disableHostCheck: true,
    progress: true,
  },
}

if (process.env.S3) {
  ;['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_REGION', 'AWS_S3_BUCKET'].forEach((variable) => {
    if (!process.env[variable]) {
      console.error(`${variable}: environment variable not found!`)
      process.exit(1)
    }
  })

  module.exports = merge(config, {
    entry: Object.entries(config.entry).reduce((obj, [key, value]) => {
      obj[`${key}-${process.env.AWS_RANDOM_SUFFIX}`] = value
      return obj
    }, {}),
    plugins: [
      new S3Plugin({
        // Exclude uploading of html
        exclude: /.*\.html$/,
        // s3Options are required
        s3Options: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_S3_REGION,
        },
        s3UploadOptions: {
          Bucket: process.env.AWS_S3_BUCKET,
        },
        basePath: process.env.AWS_S3_BASEPATH || process.env.npm_package_name,
      }),
    ],
  })
} else {
  module.exports = config
}
