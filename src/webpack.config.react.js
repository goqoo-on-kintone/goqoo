const config = require('./webpack.config')
const { merge } = require('webpack-merge')

const babelOptions = {
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        useBuiltIns: 'usage',
        corejs: 3,
        targets: { browsers: ['last 2 versions'] },
        modules: false,
      },
    ],
    require.resolve('@babel/preset-react'),
  ],
}
const babelOptionsTs = JSON.parse(JSON.stringify(babelOptions))
babelOptionsTs.presets.push(require.resolve('@babel/preset-typescript'))

console.log('foo')
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
