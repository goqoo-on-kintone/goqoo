import { describe, it, expect } from 'vitest'
import { buildUploadPlan } from '../src/s3'

describe('buildUploadPlan', () => {
  it('dist の .js を basePath とサフィックス付きのキーへ対応付ける', () => {
    const plan = buildUploadPlan(['foo.js', 'bar.js', 'foo.js.map'], {
      basePath: 'myapp',
      suffix: 'x1y2',
    })
    expect(plan).toContainEqual({ file: 'foo.js', key: 'myapp/foo-x1y2.js' })
    expect(plan).toContainEqual({ file: 'bar.js', key: 'myapp/bar-x1y2.js' })
    expect(plan).toContainEqual({ file: 'foo.js.map', key: 'myapp/foo-x1y2.js.map' })
  })
})
