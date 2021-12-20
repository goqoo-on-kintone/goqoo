export type Config<Env extends string = string, Context = any> = {
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
