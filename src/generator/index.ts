import { dirname, join } from 'path'
import { loadGoqooConfig } from '../util'

const main = async (argv: any): Promise<void> => {
  const rawArgv = process.argv.slice(3)
  const templateDirRoot = join(dirname(require.resolve('@goqoo/templates/package.json')), 'templates')

  if (argv._subCommand === 'new') {
    const [projectDir] = rawArgv
    return import('./new').then(({ run }) => run({ templateDirRoot, projectDir }))
  }

  const goqooConfig = await loadGoqooConfig()
  const [generatorName, appName] = rawArgv

  if (generatorName === 'dts') {
    return import('./dts').then(({ run }) => run(goqooConfig))
  }

  if (!generatorName || !appName) {
    // TODO: ちゃんと関数化などする
    console.error(`usage: goqoo generate GENERATOR APP`)
    process.exit(1)
  }

  switch (generatorName) {
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
