const config = require('./webpack.config')
const { mergeWithRules } = require('webpack-merge')

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
})
