// @ts-check

const baseConfigFactory = require('./webpack.config')
const { mergeWithRules } = require('webpack-merge')

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
          test: /\.(scss)$/,
          use: [
            { loader: require.resolve('style-loader') },
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
          loader: require.resolve('html-loader'),
        },
      ],
    },
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js',
      },
    },
  }

  return mergeWithRules({
    module: {
      // @ts-expect-error
      rules: { test: 'match', use: 'replace' },
    },
  })(baseConfig, vueConfig)
}
