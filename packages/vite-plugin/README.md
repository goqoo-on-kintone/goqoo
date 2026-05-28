# @goqoo/vite-plugin

kintone カスタマイズ向けの Vite プラグイン（goqoo v2）。

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { goqoo } from '@goqoo/vite-plugin'

export default defineConfig({
  plugins: [goqoo({ appsDir: 'src/apps' })],
})
```

`src/apps/` 配下の各ファイルを `dist/<name>.js`（自己完結 IIFE・CSS インライン・devinfo banner 付き）として出力する。dev（`vite`）では `https://localhost:59000/<name>.js` に HMR ブートストラップを配信する。

S3 へホスティングする場合は `goqooS3()` を併用する（`@aws-sdk/client-s3` が必要）。
