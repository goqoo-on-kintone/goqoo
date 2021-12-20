export type Config<Env extends string = string, Context = any> = {
  bundlerType?: 'default' | 'react' | 'vue'
  nodeEnv?: Env
  dtsGen?: { env: Env; skip?: string[] }
  environments: Context[]
}
