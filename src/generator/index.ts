import { dirname, join } from 'path'
import { cosmiconfigSync } from 'cosmiconfig'
import TypeScriptLoader from '@endemolshinegroup/cosmiconfig-typescript-loader'
import type { ConfigBase } from '../types/goqoo.types'

const main = async (argv: any): Promise<void> => {
  const rawArgv = process.argv.slice(3)
  const templateDirRoot = join(dirname(require.resolve('@goqoo/templates/package.json')), 'templates')

  if (argv._subCommand === 'new') {
    const [projectDir] = rawArgv
    import('./new').then(({ run }) => run({ templateDirRoot, projectDir }))
  }

  const [generatorName, appName] = rawArgv
  if (!generatorName || !appName) {
    // TODO: ちゃんと関数化などする
    console.error(`usage: goqoo generate GENERATOR APP`)
    process.exit(1)
  }

  const moduleName = 'goqoo'
  const explorer = cosmiconfigSync(moduleName, {
    searchPlaces: [`${moduleName}.config.ts`],
    loaders: {
      '.ts': TypeScriptLoader,
    },
  })
  const goqooConfig: ConfigBase | undefined = await explorer.search()?.config
  if (!goqooConfig) {
    throw new Error('goqoo.config.ts not found')
  }

  switch (generatorName) {
    case 'dts':
      // @ts-expect-error
      return import('./dts').then(({ run }) => run({}))

    case 'scaffold':
      // TODO: appとin-appの組み合わせ全部入り
      return import('./scaffold').then(({ run }) => run({}))

    case 'app':
    case 'space':
    case 'portal':
      return import('./app').then(({ run }) => run({ templateDirRoot, goqooConfig, generatorName, appName }))

    default:
      // event, customize-viewなど、既存アプリ内にgenerateするもの
      await import('./in-app').then(({ run }) => run({ templateDirRoot, goqooConfig, generatorName, appName }))
  }
}

export default async (argv: any): Promise<void> => {
  try {
    await main(argv)
  } catch (e) {
    console.error(e)
  }
}
