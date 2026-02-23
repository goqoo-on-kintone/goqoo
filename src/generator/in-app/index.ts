import { SAO, handleError } from 'sao'
import { resolve, join } from 'path'
import { existsDirectory, projectPath } from '../../_common/util'
import type { Config } from '../../lib'

type Runner = (props: { templateDirRoot: string; goqooConfig: Config; generatorName: string; appName: string }) => void

export const run: Runner = ({ templateDirRoot, goqooConfig, generatorName, appName }) => {
  const appDir = projectPath(`./src/apps/${appName}`)
  if (!existsDirectory(appDir)) {
    console.error(`Not a directory: ${appDir}`)
    process.exit(1)
  }

  // TODO: templateDirをユーザーが指定可能に
  const bundlerType = goqooConfig.bundlerType || 'default'
  // テンプレートのin-appディレクトリ内にあるフォルダ(generatorName)を利用する
  const templateDir = join(templateDirRoot, bundlerType, 'src/in-app', generatorName)
  if (!existsDirectory(templateDir)) {
    console.error(`Template not found: ${templateDir}`)
    process.exit(1)
  }

  const sao = new SAO({
    generator: resolve(__dirname, './'),
    outDir: join(appDir),
    answers: { generatorName, appName, templateDir },
  })
  sao.run().catch(handleError)
}
