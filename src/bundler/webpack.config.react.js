const config = require('./webpack.config')
const { merge } = require('webpack-merge')
const { babelOptions, babelOptionsTs } = require('./babel-options')

const presetReact = require.resolve('@babel/preset-react')
babelOptions.presets.push(presetReact)
babelOptionsTs.presets.push(presetReact)

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
    ],
  },
})
