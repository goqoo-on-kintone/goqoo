# goqoo v2 リリース / publish フロー（2026-05-29）

verdaccio による公開前検証まで実施済み。**npm への実 publish は kintone 実機検証の完了後**に行う。

## パッケージとバージョニング

| パッケージ | 種別 | バージョニング |
|---|---|---|
| `@goqoo/vite-plugin` | ランタイム（ビルド） | **lockstep**（fixed group） |
| `@goqoo/lib` | ランタイム | **lockstep** |
| `goqoo`（meta） | 依存集約 + 名前確保 | **lockstep** |
| `create-goqoo` | scaffolder | **独立**（Vue 型 = 案A） |

- lockstep は Changesets の `fixed: [["@goqoo/*", "goqoo"]]` で実現（[バージョン方針](./README.md)）。
- メタ `goqoo` は `@goqoo/lib` / `@goqoo/vite-plugin` を **`workspace:^`** で参照 → publish 時に `^2.0.0` へ自動置換される（検証済み）。

## 初回リリース（2.0.0）— changeset を使わず直接公開

> 現在 package.json は 2.0.0。changeset を使うと `changeset version` が 3.0.0 を算出してしまうため、
> 初回は changeset を置かずに 2.0.0 を直接 publish する（初期の major changeset は削除済み）。

```bash
pnpm install            # メタの workspace:^ リンクを確実にする（重要）
pnpm -r build           # 全パッケージビルド
pnpm -r test            # 全緑確認（現状 30 tests）
# （任意）verdaccio で dry-run（下記）
npm login               # npm にログイン（@goqoo スコープの公開権限が必要）
pnpm -r publish --access public
```

- `pnpm -r publish` は依存順に publish する。**メタ `goqoo` は lib/plugin の後**に出る。
- `pnpm install` を先に走らせないと、メタの `workspace:^` が解決できず
  `ERR_PNPM_CANNOT_RESOLVE_WORKSPACE_PROTOCOL` になる（検証中に実際に発生）。
- private な root（`goqoo-monorepo`）は publish 対象外。
- `create-goqoo` も同時に publish される（初回は 2.0.0 に揃える）。

## 2 回目以降 — Changesets 運用

```bash
pnpm changeset                  # 変更を記述、bump レベルを選ぶ
pnpm changeset version          # lockstep グループはまとめて bump、create-goqoo は独立に bump
pnpm -r build && pnpm -r test
pnpm -r publish
```

- `create-goqoo` は lib/plugin の patch/minor では追従しない。テンプレ/CLI 変更や上流メジャー追従時のみ
  changeset を置いてリリースする（create-vite / create-vue と同じ運用）。

## 公開前 dry-run（verdaccio）— 2026-05-29 検証済み手順

ローカルレジストリで「実 publish 相当」を検証する。`@goqoo/* ^2` の解決まで本番同様に確認できる。

```bash
# 1) verdaccio 設定（匿名 publish 許可）
cat > /tmp/goqoo-verdaccio/config.yaml <<'YAML'
storage: /tmp/goqoo-verdaccio/storage
uplinks: { npmjs: { url: https://registry.npmjs.org/ } }
packages:
  '@goqoo/*': { access: $all, publish: $anonymous, unpublish: $anonymous }
  'goqoo':   { access: $all, publish: $anonymous, unpublish: $anonymous }
  'create-goqoo': { access: $all, publish: $anonymous, unpublish: $anonymous }
  '**':      { access: $all, publish: $anonymous, proxy: npmjs }
YAML
npx verdaccio@latest --config /tmp/goqoo-verdaccio/config.yaml --listen 4873 &

# 2) 一時 npmrc（偽トークン。匿名 publish なので中身は任意）
printf 'registry=http://localhost:4873/\n//localhost:4873/:_authToken=fake\n@goqoo:registry=http://localhost:4873/\n' > /tmp/goqoo-verdaccio/.npmrc

# 3) publish（workspace:^ → ^2.0.0 に置換される）
pnpm install
pnpm -r build
npm_config_userconfig=/tmp/goqoo-verdaccio/.npmrc pnpm -r publish --no-git-checks --registry http://localhost:4873

# 4) 生成プロジェクトで検証（install→build）
#    CLI は対話式のため、scaffold() で生成 or npm create goqoo を TTY 上で実行
cd <生成先> && printf 'registry=http://localhost:4873/\n@goqoo:registry=http://localhost:4873/\n' > .npmrc
npm install && npm run build   # dist/<name>.js（自己完結 IIFE）が出れば OK
```

**検証結果（2026-05-29）**:
- 4 パッケージとも verdaccio へ publish 成功。
- メタ `goqoo` の deps が `^2.0.0` に正しく置換されて公開された。
- 実 `scaffold()` で生成したプロジェクトが `@goqoo/* ^2` を verdaccio から解決して `vite build` 成功
  → `dist/sample.js`（bare import 0 / devinfo banner / SweetAlert2 CSS インライン）。
- 公開フロー（`pnpm -r publish` + workspace 置換 + 依存順）が成立することを確認。

## 注意 / 既知事項

- **`create-goqoo` の CLI は対話式（@clack/prompts）で、piped / 非 TTY 実行は不可**（検証で確認）。
  生成ロジックは `scaffold()` の単体テスト + 上記 e2e（実 scaffold 生成 → verdaccio install → build）で担保。
  CLI のプロンプト動作自体は TTY 上での手動確認が必要。
- npm への実 publish は **kintone 実機検証の完了後**に実施する。
- （任意の polish）各パッケージの `exports` に `"./package.json": "./package.json"` を足すと、
  `<pkg>/package.json` を読む一部ツールとの相性が良くなる（必須ではない）。
