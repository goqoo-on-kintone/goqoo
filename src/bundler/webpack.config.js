// @ts-check

const path = require('path')
const fs = require('fs')
const { EnvironmentPlugin } = require('webpack')
const Dotenv = require('dotenv-webpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
// @ts-expect-error
const S3Plugin = require('webpack-s3-plugin')
const { mergeWithCustomize, customizeObject } = require('webpack-merge')
const { projectPath } = require('../_common/util')
const { babelOptions, babelOptionsTs } = require('./babel-options')
require('dotenv').config()

/**
 * @typedef {import('webpack').Configuration} Configuration
 * @typedef {import('./types').ConfigurationFactory} ConfigurationFactory
 */

/**
 * @type {ConfigurationFactory}
 */
module.exports = (env, argv) => {
  if (!env) {
    env = {}
  }
  console.info({ mode: argv.mode })
  console.info({ env })

  const srcPath = path.resolve('src')
  const appsPath = path.join(srcPath, 'apps')

  /**
   * @type {import('webpack').EntryObject}
   */
  const entryObject = Object.fromEntries(
    fs
      .readdirSync(appsPath)
      .filter((file) => !/^\./.test(file)) // Exclude dotfiles
      .map((file) => [path.parse(file).name, path.resolve(appsPath, file)])
  )

  /**
   * @type {Configuration}
   */
  const config = {
    entry: entryObject,
    output: { path: path.resolve('dist') },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          use: [
            { loader: require.resolve('babel-loader'), options: babelOptions },
            require.resolve('source-map-loader'),
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.ts$/,
          use: [{ loader: require.resolve('babel-loader'), options: babelOptionsTs }],
          exclude: /node_modules/,
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
            {
              loader: require.resolve('sass-loader'),
              options: {
                implementation: require.resolve('sass'),
              },
            },
          ],
        },
        {
          test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
          use: [{ loader: require.resolve('url-loader') }],
        },
      ],
    },
    resolve: {
      modules: [srcPath, 'node_modules'],
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    plugins: [
      new EnvironmentPlugin({
        BUILT_NODE_ENV: process.env.NODE_ENV,
        COMMIT_HASH: require('child_process').execSync('git rev-parse --short HEAD').toString().trim(),
        BUILT_AT: new Date(),
      }),
      new Dotenv({
        path: projectPath(`.env.${process.env.NODE_ENV}`),
      }),
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
      port: argv.port,
      headers: { 'Access-Control-Allow-Origin': '*' },
      disableHostCheck: true,
    },
  }

  if (env?.WEBPACK_SERVE) {
    const urls = Object.fromEntries(
      Object.keys(entryObject).map((key) => [key, `https://localhost:${config.devServer?.port}/${key}.js`])
    )
    console.info(urls)
  }

  if (!env?.S3) {
    return config
  }

  console.info('Upload to S3')
  ;['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_REGION', 'AWS_S3_BUCKET'].forEach((variable) => {
    if (!process.env[variable]) {
      console.error(`${variable}: environment variable not found!`)
      process.exit(1)
    }
  })

  const suffix = process.env.AWS_RANDOM_SUFFIX
  const region = process.env.AWS_S3_REGION
  const Bucket = process.env.AWS_S3_BUCKET
  const basePath = process.env.AWS_S3_BASEPATH ?? process.env.npm_package_name ?? ''

  const entryObjectS3 = Object.fromEntries(
    Object.entries(entryObject).map(([key, value]) => [`${key}-${suffix}`, value])
  )
  const urls = Object.fromEntries(
    Object.keys(entryObject).map((key) => [
      key,
      `https://${Bucket}.s3.${region}.amazonaws.com/${basePath}/${key}-${suffix}.js`,
    ])
  )
  console.info(urls)

  const merge = mergeWithCustomize({
    customizeObject: customizeObject({
      entry: 'replace',
    }),
  })

  return merge(config, {
    entry: entryObjectS3,
    plugins: [
      new S3Plugin({
        exclude: /.*\.html$/,
        s3Options: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKeyId: process.env.AWS_SECRET_ACCESS_KEY,
          sessionToken: process.env.AWS_SESSION_TOKEN,
          region,
        },
        s3UploadOptions: {
          Bucket,
          CacheControl: 'private',
          // NOTE:
          // S3Pluginのデフォルトでは、ACL:public-readになっているが、
          // S3側でバケットのACLをオフにしているとアップロードエラーになる（デフォルトではACLオフ）
          // ACLオフのまま使いたいGoqooユーザーは、環境変数で AWS_S3_ACL=private にすればOK
          // その場合、アップロードしたJSにパブリックアクセスができないので、
          // S3側のバケットポリシーでs3:GetObjectを全体に許可する必要がある
          // https://github.com/MikaAK/s3-plugin-webpack/issues/28
          ACL: process.env.AWS_S3_ACL,
        },
        basePath,
      }),
    ],
  })
}
