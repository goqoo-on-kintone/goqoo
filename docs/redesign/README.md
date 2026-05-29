# goqoo 大規模再設計 壁打ちメモ

このディレクトリは、2026年2月から始まった goqoo エコシステムの再設計に関する
ブレインストーミングの記録です。

## セッション一覧

- 2026-02-24: 初回セッション（準備中）

## 設計書

- [2026-05-28: @goqoo/vite-plugin 設計書](./2026-05-28-vite-plugin-design.md)
- [2026-05-28: @goqoo/lib 設計書](./2026-05-28-lib-design.md)
- [2026-05-28: create-goqoo 設計書](./2026-05-28-create-design.md)

## 実装計画

- [2026-05-28: モノレポ足場 + @goqoo/vite-plugin 実装計画](./2026-05-28-monorepo-vite-plugin-plan.md)
- [2026-05-28: @goqoo/lib 実装計画](./2026-05-28-lib-plan.md)
- [2026-05-28: create-goqoo 実装計画](./2026-05-28-create-plan.md)

## リリース

- [2026-05-29: リリース / publish フロー（verdaccio 検証済み）](./2026-05-29-release-flow.md)

## バージョン方針（2026-05-28 決定 / 2026-05-29 改定）

- **ランタイムは lockstep、scaffolder は独立**（Vue 型 = 案A）。2026-05-29 に当初の「全部 lockstep」から改定。
  - **lockstep グループ**: `@goqoo/vite-plugin` / `@goqoo/lib` /（将来の）メタ `goqoo`。常に同一バージョンでまとめて上げる。
  - **独立**: `create-goqoo`（scaffolder）。lib/plugin の patch/minor では追従せず、テンプレ/CLI 変更や
    上流メジャー追従のタイミングで独立にリリース（create-vite / create-vue と同じ運用）。
- v2 世代として **2.0.0 から開始**（create-goqoo も初回は 2.0.0 に揃え、以降は独立に推移）。
- 「全部 v2」の見かけの統一感は**メタパッケージ `goqoo`（全部入り）**が担うため、scaffolder を lockstep に
  縛る必要はない（Angular/Rails 型ではなく Vue 型を採用）。
- 実装: Changesets の `fixed` グループは `[["@goqoo/*"]]`（= vite-plugin + lib）。create-goqoo は fixed に入れない。
  メタ `goqoo` パッケージ作成時に同グループへ追加する。
- ⚠️ session-2026-02-24 の「各サブパッケージは独立管理」は、ランタイムのみ lockstep に改める（scaffolder は独立のまま）。
- ⚠️ 初回公開の版数: 現状 package.json は 2.0.0 かつ changeset が `major` のため、`changeset version` は 3.0.0 を算出する。
  初回は 2.0.0 を直接公開し、以降 changeset 運用に乗せる等、publish フロー設計時に確定する。
