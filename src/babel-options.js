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
  ],
}
const babelOptionsTs = JSON.parse(JSON.stringify(babelOptions))
babelOptionsTs.presets.push(require.resolve('@babel/preset-typescript'))

module.exports = { babelOptions, babelOptionsTs }
