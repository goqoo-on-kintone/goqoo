import gyuma from 'gyuma'

type ProxyOption =
  | string
  | {
      protocol: string
      auth: string
      hostname: string
      port: number
    }
type PfxOption = { filepath: string; password: string }
type AgentOptions = { proxy?: ProxyOption; pfx?: PfxOption }

export const getOauthToken = async (domain: string, agentOptions: AgentOptions) => {
  const scope = 'k:app_settings:read'
  const token = await gyuma({ domain, scope, ...agentOptions }, true)
  return token
}
