export const getQueryOrder = (): string => {
  // @ts-expect-error
  const matchResult = kintone.app.getQuery().match(/order by (.*) limit/)
  const orderBy = Array.isArray(matchResult) ? matchResult[1] : ''
  return orderBy
}

// TODO: getSpaceId()関数を追加
// async関数になる
// * URLにスペースIDが含まれていればそれを取得
// * kintone.app.getId()が値を返せば、そこからREST API経由で取得
// * ゲストスペースかどうかも分かる
// * ポータルで叩いた場合はundefinedかエラーか
