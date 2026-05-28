import { describe, it, expect } from 'vitest'
import { buildPackageJson } from '../src/builders'

const base = { name: 'myapp', description: 'd', ginue: false, gyuma: false, trunks: false }

describe('buildPackageJson', () => {
  it('基本の deps と scripts を含む（dev ビルドは --mode development）', () => {
    const pkg = buildPackageJson(base)
    expect(pkg.name).toBe('myapp')
    expect(pkg.dependencies).toHaveProperty('vite')
    expect(pkg.dependencies).toHaveProperty('@goqoo/vite-plugin')
    expect(pkg.dependencies).toHaveProperty('@goqoo/lib')
    expect(pkg.devDependencies).toHaveProperty('typescript')
    expect(pkg.devDependencies).toHaveProperty('@kintone/customize-uploader')
    expect(pkg.scripts.dev).toBe('vite')
    expect(pkg.scripts.build).toBe('vite build --mode development')
    expect(pkg.scripts.release).toBe('vite build --mode production')
    expect(pkg.scripts.typecheck).toBe('tsc --noEmit')
    expect(pkg.scripts.upload).toContain('kintone-customize-uploader')
  })

  it('gyuma 選択時は gyuma devDep と upload:oauth を追加', () => {
    const pkg = buildPackageJson({ ...base, gyuma: true })
    expect(pkg.devDependencies).toHaveProperty('gyuma')
    expect(pkg.scripts['upload:oauth']).toContain('gyuma')
    expect(pkg.scripts['upload:oauth']).toContain('kintone-customize-uploader')
  })

  it('trunks 選択時は trunks devDep と dts script を追加', () => {
    const pkg = buildPackageJson({ ...base, trunks: true })
    expect(pkg.devDependencies).toHaveProperty('trunks')
    expect(pkg.scripts.dts).toBeDefined()
  })

  it('ginue 選択時は ginue devDep と ginue script を追加', () => {
    const pkg = buildPackageJson({ ...base, ginue: true })
    expect(pkg.devDependencies).toHaveProperty('ginue')
    expect(pkg.scripts['ginue:pull']).toBeDefined()
  })
})
