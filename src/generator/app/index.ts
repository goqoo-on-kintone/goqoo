import { SAO, handleError } from 'sao'
import { resolve, join } from 'path'
import { existsDirectory, projectPath } from 'utils'
import type { ConfigBase } from 'types/goqoo.types'

type Runner = (props: {
  templateDirRoot: string
  goqooConfig: ConfigBase
  generatorName: string
  appName: string
}) => void

export const run: Runner = ({ templateDirRoot, goqooConfig, generatorName, appName }) => {
  const appsDir = projectPath('./src/apps')
  if (!existsDirectory(appsDir)) {
    console.error(`Not a directory: ${appsDir}`)
    process.exit(1)
  }

  // TODO: templateDirをユーザーが指定可能に
  const bundlerType = goqooConfig.bundlerType || 'standard'
  const templateDir = join(templateDirRoot, bundlerType, 'src/apps', generatorName)
  if (!existsDirectory(templateDir)) {
    console.error(`Template not found: ${templateDir}`)
    process.exit(1)
  }

  const sao = new SAO({
    generator: resolve(__dirname, './'),
    outDir: join(appsDir, appName),
    answers: { name: appName, templateDir },
  })
  sao.run().catch(handleError)
}
