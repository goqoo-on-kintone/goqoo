# goqoo 大規模再設計 壁打ちメモ

このディレクトリは、2026年2月から始まった goqoo エコシステムの再設計に関する
ブレインストーミングの記録です。

## セッション一覧

- 2026-02-24: 初回セッション（準備中）

## 設計書

- [2026-05-28: @goqoo/vite-plugin 設計書](./2026-05-28-vite-plugin-design.md)
- [2026-05-28: @goqoo/lib 設計書](./2026-05-28-lib-design.md)
- [2026-05-28: create-goqoo 設計書](./2026-05-28-create-design.md)

## バージョン方針（2026-05-28 決定）

- **lockstep バージョニング**を採用。全パッケージ（メタ `goqoo` / `@goqoo/vite-plugin` /
  `@goqoo/lib` / `create-goqoo`）を**常に同一バージョンでまとめて上げる**（Babel/Jest 方式）。
- v2 世代として **2.0.0 から開始**。新3点も最初から 2.0.0。
- これにより「全部 v2」が今後も維持される。
- ⚠️ session-2026-02-24 の「各サブパッケージは Changesets で独立管理」は **lockstep に改める**
  （Changesets の fixed/locked グループ設定で実現）。
