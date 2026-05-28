declare const kintone: { app: { getQuery: () => string } }

export const getQueryOrder = (): string => {
  const matchResult = kintone.app.getQuery().match(/order by (.*) limit/)
  return Array.isArray(matchResult) ? matchResult[1] : ''
}
