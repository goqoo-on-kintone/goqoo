// @ts-check

/**
 * @typedef {import('@babel/core').TransformOptions} TransformOptions
 */

/**
 * @type {TransformOptions}
 */
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

/**
 * @type {TransformOptions}
 */
const babelOptionsTs = JSON.parse(JSON.stringify(babelOptions))
// @ts-expect-error
babelOptionsTs.presets.push(require.resolve('@babel/preset-typescript'))

module.exports = { babelOptions, babelOptionsTs }
