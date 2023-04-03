import { SAO, handleError } from 'sao'
import { resolve } from 'path'
import { existsDirectory } from '../../_common/util'

type Runner = (props: { templateDirRoot: string; projectDir: string }) => void

export const run: Runner = ({ templateDirRoot, projectDir }) => {
  // TODO: templateDirをユーザーが指定可能に
  const templateDir = templateDirRoot
  if (!existsDirectory(templateDir)) {
    console.error(`Template not found: ${templateDir}`)
    process.exit(1)
  }

  const sao = new SAO({
    generator: resolve(__dirname, './'),
    outDir: projectDir,
    answers: { templateDir },
  })
  sao.run().catch(handleError)
}
