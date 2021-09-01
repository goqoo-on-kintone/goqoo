// @ts-check

const baseConfigFactory = require('./webpack.config')
const { mergeWithRules } = require('webpack-merge')
const { babelOptions, babelOptionsTs } = require('./babel-options')

const presetReact = require.resolve('@babel/preset-react')
// @ts-expect-error
babelOptions.presets.push(presetReact)
// @ts-expect-error
babelOptionsTs.presets.push(presetReact)

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
  const reactConfig = {
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: [{ loader: require.resolve('babel-loader'), options: babelOptions }],
          exclude: /node_modules/,
        },
        {
          test: /\.tsx?$/,
          use: [{ loader: require.resolve('babel-loader'), options: babelOptionsTs }],
          exclude: /node_modules/,
          options: babelOptionsTs,
        },
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
      ],
    },
  }

  return mergeWithRules({
    module: {
      // @ts-expect-error
      rules: { test: 'match', use: 'replace' },
    },
  })(baseConfig, reactConfig)
}
