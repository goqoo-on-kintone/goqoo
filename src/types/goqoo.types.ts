export type AppId = Record<string, number>
export type ApiToken = Record<string, string>

export interface ContextBase {
  env: string
  domain: string
  appId: AppId
  apiToken?: ApiToken
  guest?: number
}

export interface Context<TEnv extends string, TAppId extends AppId, TApiToken extends ApiToken> extends ContextBase {
  env: TEnv
  domain: string
  appId: TAppId
  apiToken?: TApiToken
  guest?: number
}

export interface ConfigBase {
  bundlerType?: 'default' | 'vue' | 'react'
  dtsGen?: { env: string; skip?: string[] }
  environments: ContextBase[]
}

export interface Config<TEnv extends string, TAppId extends AppId, TApiToken extends ApiToken> extends ConfigBase {
  dtsGen?: { env: TEnv; skip?: string[] }
  environments: Context<TEnv, TAppId, TApiToken>[]
}
