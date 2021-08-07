module.exports = {
  extends: ['standard', 'prettier'],
  plugins: ['node', 'mocha'],
  env: { mocha: true },
  globals: {
    // テスト用のグローバル変数 TODO: 自動的にglobalを認識させたい
    assert: true,
    goqoo: true,
  },
  rules: {
    'comma-dangle': ['error', 'only-multiline'],
    'no-debugger': 'off',
    'no-var': 'error',
    'prefer-const': 'error',
    'node/no-missing-require': 'error',
  },
}
