export type ProxyOption = { url: string; auth?: { username: string; password: string } }
export type PfxOption = { pfx: string; passphrase?: string }

type PasswordAuth = { type: 'password' }
type OAuth = { type: 'oauth'; scope?: string }
type ApiTokenAuth = { type: 'apiToken' }
type AuthOption = { proxy?: ProxyOption; pfx?: PfxOption }
export type Auth = (PasswordAuth | OAuth | ApiTokenAuth) & AuthOption

export type Environment<Env extends string = string> = {
  env: Env
  host: string
  appId: Record<string, number>
  auth: Auth
}

export type Config<Env extends string = string> = {
  nodeEnv?: Env
  environments: Environment<Env>[]
}

export type DevInfo = {
  nodeEnv: string
  commitHash: string
  builtAt: string
}

export class GoqooError extends Error {
  constructor(
    message: string,
    readonly appId: number | string,
    readonly recordId: number | string
  ) {
    super(message)
    this.name = 'GoqooError'
  }
}

declare global {
  interface Window {
    __goqoo__: Record<string, boolean>
    __devinfo__: Record<string, DevInfo>
  }
}
