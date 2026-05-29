import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  // vite はホスト、css-injected-by-js と aws-sdk は実行時にコンシューマ側で解決
  external: ['vite', 'vite-plugin-css-injected-by-js', '@aws-sdk/client-s3'],
})
