# goqoo

kintone カスタマイズ開発フレームワーク **goqoo v2** のメタパッケージです。
このパッケージ自体にコードはなく、以下のランタイムをまとめて導入するためのものです。

- [`@goqoo/vite-plugin`](https://www.npmjs.com/package/@goqoo/vite-plugin) — kintone 向け Vite プラグイン（ビルド / dev サーバ）
- [`@goqoo/lib`](https://www.npmjs.com/package/@goqoo/lib) — ランタイム（`goqoo()` / ダイアログ / 型）

## 新規プロジェクトの作成（推奨）

```bash
npm create goqoo@latest my-app
```

scaffold は [`create-goqoo`](https://www.npmjs.com/package/create-goqoo) が行い、
`vite.config.ts` への `@goqoo/vite-plugin` 設定や `src/apps/` のサンプル、アップロード設定までまとめて生成します。

## 既存プロジェクトへ追加する場合

```bash
npm install goqoo
# 内部的に @goqoo/vite-plugin と @goqoo/lib が入ります
```

利用時は各パッケージから直接 import / 設定します（メタからの再 export は行いません。
`@goqoo/lib` の `goqoo()` と `@goqoo/vite-plugin` の `goqoo()` が同名のため衝突を避ける設計です）。

```ts
// vite.config.ts
import { goqoo } from '@goqoo/vite-plugin'
// src/apps/*.ts
import { goqoo } from '@goqoo/lib'
```

詳細は各パッケージの README を参照してください。
