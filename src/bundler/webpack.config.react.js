const config = require('./webpack.config')
const { mergeWithRules } = require('webpack-merge')
const { babelOptions, babelOptionsTs } = require('./babel-options')

const presetReact = require.resolve('@babel/preset-react')
babelOptions.presets.push(presetReact)
babelOptionsTs.presets.push(presetReact)

const merge = mergeWithRules({
  module: {
    rules: {
      test: 'match',
      use: 'replace',
    },
  },
})

module.exports = merge(config, {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: require.resolve('babel-loader'),
        exclude: /node_modules/,
        options: babelOptions,
      },
      {
        test: /\.tsx?$/,
        loader: require.resolve('babel-loader'),
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
})
