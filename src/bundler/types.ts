import type { Configuration } from 'webpack'

type CliConfigOptions = {
  'config'?: string | undefined
  'mode'?: Configuration['mode'] | undefined
  'env'?: string | undefined
  'config-register'?: string | undefined
  'configRegister'?: string | undefined
  'config-name'?: string | undefined
  'configName'?: string | undefined
  'port': number
}

export type ConfigurationFactory = (
  env: Record<string, boolean | number | string> | undefined,
  args: CliConfigOptions
) => Configuration | Promise<Configuration>
