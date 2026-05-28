import type { Plugin } from 'vite'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export type S3PlanOptions = { basePath: string; suffix: string }
export type UploadItem = { file: string; key: string }

/** dist 内ファイル名から S3 キーを決める（<base>/<name>-<suffix>.<ext...>） */
export const buildUploadPlan = (files: string[], { basePath, suffix }: S3PlanOptions): UploadItem[] =>
  files.map((file) => {
    const [name, ...rest] = file.split('.')
    const ext = rest.length ? '.' + rest.join('.') : ''
    const key = `${basePath}/${name}-${suffix}${ext}`
    return { file, key }
  })

export type GoqooS3Options = {
  bucket: string
  region: string
  basePath?: string
  suffix?: string
  acl?: string
  outDir?: string
}

export const goqooS3 = (options: GoqooS3Options): Plugin => {
  return {
    name: 'goqoo-s3',
    apply: 'build',
    async closeBundle() {
      const awsSdk = await import('@aws-sdk/client-s3').catch(() => {
        throw new Error('goqooS3 requires @aws-sdk/client-s3. Run: pnpm add -D @aws-sdk/client-s3')
      })
      const { S3Client, PutObjectCommand } = awsSdk as typeof import('@aws-sdk/client-s3')
      const outDir = options.outDir ?? 'dist'
      const basePath = options.basePath ?? ''
      const suffix = options.suffix ?? Math.random().toString(36).slice(2, 8)
      const files = readdirSync(outDir).filter((f) => f.endsWith('.js') || f.endsWith('.js.map'))
      const plan = buildUploadPlan(files, { basePath, suffix })
      const client = new S3Client({ region: options.region })
      for (const { file, key } of plan) {
        await client.send(
          new PutObjectCommand({
            Bucket: options.bucket,
            Key: key,
            Body: readFileSync(join(outDir, file)),
            CacheControl: 'private',
            ACL: options.acl as never,
            ContentType: file.endsWith('.map') ? 'application/json' : 'application/javascript',
          })
        )
        console.info(`uploaded: https://${options.bucket}.s3.${options.region}.amazonaws.com/${key}`)
      }
    },
  }
}
