export type AppId = Record<string, number>
export type ApiToken = Record<string, string>

export type Context<
  TEnv extends string = string,
  TAppId extends AppId = AppId,
  TApiToken extends ApiToken = ApiToken
> = {
  env: TEnv
  domain: string
  appId: TAppId
  currentAppName?: keyof TAppId
  apiToken?: TApiToken
  guest?: number
}

export type Config<
  TEnv extends string = string,
  TAppId extends AppId = AppId,
  TApiToken extends ApiToken = ApiToken
> = {
  bundlerType?: 'default' | 'react' | 'vue'
  dtsGen?: { env: TEnv; skip?: string[] }
  environments: Context<TEnv, TAppId, TApiToken>[]
}
