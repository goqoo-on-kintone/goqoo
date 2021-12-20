export const getQueryOrder = (): string => {
  // @ts-expect-error
  const matchResult = kintone.app.getQuery().match(/order by (.*) limit/)
  const orderBy = Array.isArray(matchResult) ? matchResult[1] : ''
  return orderBy
}
