import netrc from 'netrc-parser'
import { gyuma, PfxOption, ProxyOption } from 'gyuma'

export const getOauthToken = async ({
  domain,
  scope = 'k:app_settings:read',
  proxy,
  pfx,
}: {
  domain: string
  scope?: string
  proxy?: ProxyOption
  pfx?: PfxOption
}): Promise<string> => {
  // プロキシサーバーの認証情報がnetrcにある場合は読み取る
  // 認証はオプションなので、認証情報が見つからなくても標準入力はさせない
  if (proxy instanceof Object && !proxy.auth) {
    netrc.loadSync()
    const netrcProxyProps = netrc.machines[proxy.hostname]
    if (netrcProxyProps) {
      proxy.auth = `${netrcProxyProps.login}:${netrcProxyProps.password}`
    }
  }

  const token = await gyuma({ domain, scope, proxy, pfx }, true)
  return token
}
