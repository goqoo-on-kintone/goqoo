import type { ProxyOption, PfxOption } from 'gyuma'

type _Context<Env> = {
  env: Env
  host: string
  appId: Record<string, number>
  oauth?: boolean | { scope: string }
  proxy?: ProxyOption
  pfx?: PfxOption
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
