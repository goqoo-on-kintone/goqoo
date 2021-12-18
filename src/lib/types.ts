export type Config<Env extends string = string, Context = any> = {
  bundlerType?: 'default' | 'react' | 'vue'
  dtsGen?: { env: Env; skip?: string[] }
  environments: Context[]
}
