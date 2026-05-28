# @goqoo/lib

goqoo v2 のランタイムライブラリ + 共有型。

- `goqoo(entryName, callback)` — 二重実行防止
- `confirmDialog` / `successDialog` / `errorDialog` / `helloGoqoo` — ダイアログ（SweetAlert2）
- `getQueryOrder()` — kintone クエリの order by 抽出
- `GoqooError` — kintone レコード情報付きエラー
- 型: `Config` / `Auth` / `Environment` / `DevInfo` ほか（`DevInfo` と `window` 拡張は本パッケージが所有）
