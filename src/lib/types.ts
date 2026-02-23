import type { ProxyOption, PfxOption } from 'gyuma'

type PasswordAuth = {
  type: 'password'
}
type OAuth = {
  type: 'oauth'
  scope?: string
}
type ApiTokenAuth = {
  type: 'apiToken'
}
type AuthOption = {
  proxy?: ProxyOption
  pfx?: PfxOption
}
export type Auth = (PasswordAuth | OAuth | ApiTokenAuth) & AuthOption

type _Context<Env> = {
  env: Env
  host: string
  appId: Record<string, number>
  auth: Auth
}

export type Config<Env extends string = string, Context extends _Context<Env> = _Context<Env>> = {
  bundlerType?: 'default' | 'react' | 'vue'
  nodeEnv?: Env
  dtsGen?: { env: Env; skip?: string[] }
  environments: Context[]
}

export class GoqooError extends Error {
  constructor(message: string, readonly appId: number | string, readonly recordId: number | string) {
    super(message)
  }
}
