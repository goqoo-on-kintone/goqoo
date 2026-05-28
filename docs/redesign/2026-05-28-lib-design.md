# @goqoo/lib 設計書（2026-05-28）

goqoo v2 再設計の第二弾。ランタイムライブラリ兼**共有型のハブ** `@goqoo/lib` の設計。
全体方針は [README](./README.md)、関連設計は [vite-plugin 設計書](./2026-05-28-vite-plugin-design.md) を参照。

## 背景と目的

現行 `src/lib/` を独立パッケージ `@goqoo/lib` として切り出す。
v2 の要件は **ビルドツール非依存**・**gyuma 非依存**・**kintone API を叩かない**純粋ランタイム + 型。

### 現行 src/lib の構成

- `goqoo.ts`: 二重実行防止 + devinfo 書き込み（luxon で `builtAt` を整形）
- `alerts.ts`: sweetalert v2 ベースの `confirmDialog` / `successDialog` / `errorDialog` / `helloGoqoo`（clipboard-copy・logo 画像を使用）
- `tools.ts`: `getQueryOrder()`（`getSpaceId()` は TODO コメントのみ）
- `types.ts`: `Auth` / `Config` / `_Context` / `GoqooError`（`gyuma` から `ProxyOption`/`PfxOption` を import）

## 確定した設計判断

| 論点 | 決定 | 理由 |
|---|---|---|
| 二重実行防止 | **残す**（`goqoo()` 維持） | kintone の SPA 遷移での二重登録を引き続き防ぐ。plugin 設計の前提と整合 |
| devinfo | **lib から削除**（plugin が banner 注入） | lib をビルドツール非依存にする。luxon 依存も消える |
| 設定型の置き場 | **lib を型のハブに**（ランタイム + 共有型） | ユーザーも upload ツールも lib から型を import。型はランタイムコストゼロ |
| gyuma 依存 | **ローカル型に置換して切る** | docs「gyuma 依存を完全に切る」と整合 |
| ダイアログ | sweetalert → **SweetAlert2**（API 名維持・戻り値は破壊的変更） | sweetalert v1系メンテ停止 |
| 配布形式 | **ESM+CJS デュアル（tsup）+ .d.ts** | Vite/モダンツールにも Jest/CJS にも対応 |

## パッケージ構成

- 配置: `packages/lib/`、名称 **`@goqoo/lib`**（docs の dir 表記 `client/` は `lib` に統一）
- ビルド: **tsup**（ESM + CJS + 型定義）。`exports` マップで dual を解決
- 役割: ランタイム + **共有型のハブ**

## 公開 API（API 名は維持、内部実装を刷新）

### goqoo()

```ts
export const goqoo = (entryName: string, callback: () => void): void => {
  window.__goqoo__ ||= {}
  if (window.__goqoo__[entryName]) {
    console.warn(`Goqoo JS code "${entryName}" is already running...`)
    return
  }
  window.__goqoo__[entryName] = true
  callback()
}
```

- **二重実行防止のみ**。`window.__devinfo__` への書き込みと luxon 依存を**削除**（devinfo は plugin が banner 注入）。

### alerts（SweetAlert2 へ刷新）

- `confirmDialog` / `successDialog` / `errorDialog` / `helloGoqoo` の**名前を維持**。
- SweetAlert2 の戻り値型（`SweetAlertResult` / `isConfirmed` 等）に変わるため、**戻り値の形は破壊的変更**（v2 で許容）。
- 挙動の対応:
  - `confirmDialog`: confirm + cancel ボタン、画面外/Esc で閉じない（`allowOutsideClick:false`, `allowEscapeKey:false`）。
  - `successDialog`: `icon:'success'` + text。
  - `errorDialog`: error アイコン + メッセージ、「詳細を表示」→ textarea 表示 + コピー。`GoqooError` の場合は該当レコードへのリンクを表示。コピーは **`navigator.clipboard`** を使用（kintone は https = secure context）。
  - `helloGoqoo`: logo を表示。
- logo は **base64 data URI でインライン**（アセットローダ不要）。

### tools

- `getQueryOrder()` を維持。
- `getSpaceId()` は **スコープ外**（将来課題。実装時に別途設計）。

## 共有型（型のハブ）

- `GoqooError`（ランタイム class + 型）。
- `Config` / `Auth` / `_Context` — **`bundlerType` / `dtsGen` を削除**して簡素化（概ね `{ nodeEnv?, environments }`）。`gyuma` 由来の `ProxyOption` / `PfxOption` は**ローカル型に置換**。
- **`DevInfo` 型** と **`window` 拡張**（`declare global { interface Window { __goqoo__: Record<string, boolean>; __devinfo__: Record<string, DevInfo> } }`）を lib が所有。

```ts
export type DevInfo = {
  nodeEnv: string
  commitHash: string
  builtAt: string
}
```

## 依存関係の変化

- 追加: `sweetalert2`
- 削除: `luxon`（devinfo 移管）／ `clipboard-copy`（navigator.clipboard へ）／ `sweetalert`（SweetAlert2 へ）／ `gyuma`（型のみだった依存をローカル型化）
- 結果: lib は **kintone API もビルドツールも gyuma も叩かない**純粋ランタイム + 型。

## テスト方針

- `goqoo()` の二重実行ガード（jsdom で `window.__goqoo__` を検証）
- alerts は SweetAlert2 を軽くモックし、分岐（confirm / error 詳細表示 / コピー / GoqooError リンク）を検証
- `getQueryOrder()` の正規表現分岐

## vite-plugin 設計への影響（整合）

- plugin が注入する `window.__devinfo__[entryName]` の形を lib の **`DevInfo` 型**に一致させる（契約を型で固定）。
- vite-plugin 設計書の「devinfo 型を公開」は **lib が所有** に確定。plugin は `DevInfo` を type-only 参照する。
- 矛盾なし。

## 主なリスク / 未確定事項

- SweetAlert2 移行に伴う**戻り値 API の破壊的変更**の周知（CLAUDE.md / README に明記）。
- `Config` 型の最終形（`nodeEnv` を残すか、Vite の mode に寄せるか）は upload ツール / `goqoo.config.js` を設計する create フェーズで再確認。
