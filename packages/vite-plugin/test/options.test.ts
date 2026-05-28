import { describe, it, expect } from 'vitest'
import { resolveOptions } from '../src/options'

describe('resolveOptions', () => {
  it('既定値を補完する', () => {
    expect(resolveOptions(undefined)).toEqual({
      appsDir: 'src/apps',
      devinfo: true,
      injectCss: true,
    })
  })

  it('指定値を優先する', () => {
    expect(resolveOptions({ appsDir: 'app', devinfo: false })).toEqual({
      appsDir: 'app',
      devinfo: false,
      injectCss: true,
    })
  })
})
