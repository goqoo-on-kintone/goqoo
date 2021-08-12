module.exports = {
  env: {
    'node': true,
    'jest/globals': true,
  },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:jest/recommended'],
  parserOptions: { ecmaVersion: 2021 },
  rules: {
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    'no-irregular-whitespace': ['error', { skipTemplates: true }],
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-var-requires': 'off',
  },
}
