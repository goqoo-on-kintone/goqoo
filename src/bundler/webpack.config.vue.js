// @ts-check

const baseConfigFactory = require('./webpack.config')
const { mergeWithRules } = require('webpack-merge')
const { VueLoaderPlugin } = require('vue-loader')
const { babelOptionsTs } = require('./babel-options')

/**
 * @typedef {import('webpack').Configuration} Configuration
 * @typedef {import('./types').ConfigurationFactory} ConfigurationFactory
 */

/**
 * @type {ConfigurationFactory}
 */
module.exports = (env, argv) => {
  const baseConfig = baseConfigFactory(env, argv)

  /**
   * @type {Configuration}
   */
  const vueConfig = {
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: [{ loader: require.resolve('vue-loader') }],
        },
        {
          test: /\.ts$/,
          use: [
            { loader: require.resolve('babel-loader'), options: babelOptionsTs },
            {
              loader: require.resolve('ts-loader'),
              options: {
                appendTsSuffixTo: [/\.vue$/],
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [{ loader: require.resolve('vue-style-loader') }, { loader: require.resolve('css-loader') }],
        },
        {
          test: /\.(scss)$/,
          use: [
            { loader: require.resolve('vue-style-loader') },
            { loader: require.resolve('css-loader') },
            {
              // for Bootstrap 5.0
              loader: require.resolve('postcss-loader'),
              options: {
                postcssOptions: {
                  plugins: function () {
                    return [require.resolve('autoprefixer')]
                  },
                },
              },
            },
            { loader: require.resolve('sass-loader') },
          ],
        },
        {
          test: /\.html$/,
          use: [{ loader: require.resolve('html-loader') }],
        },
      ],
    },

    // @ts-expect-error
    plugins: [new VueLoaderPlugin()],
    resolve: {
      extensions: ['.vue'],
      alias: {
        vue$: 'vue/dist/vue.esm.js',
      },
    },
  }

  const config = mergeWithRules({
    module: {
      // @ts-expect-error
      rules: { test: 'match', use: 'replace' },
    },
  })(baseConfig, vueConfig)
  // @ts-expect-error
  console.log(config.module.rules)
  return config
}
