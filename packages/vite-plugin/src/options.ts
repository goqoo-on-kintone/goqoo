export type GoqooOptions = {
  appsDir?: string
  devinfo?: boolean
  injectCss?: boolean
}

export type ResolvedGoqooOptions = Required<GoqooOptions>

export const resolveOptions = (options: GoqooOptions | undefined): ResolvedGoqooOptions => ({
  appsDir: options?.appsDir ?? 'src/apps',
  devinfo: options?.devinfo ?? true,
  injectCss: options?.injectCss ?? true,
})
