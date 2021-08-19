import { DateTime } from 'luxon'

export const goqoo = (entryName: string, callback: () => void): void => {
  if (!window.__goqoo__) {
    window.__goqoo__ = {}
  }

  if (!window.__goqoo__[entryName]) {
    window.__goqoo__[entryName] = true
    window.__devinfo__ = {
      env: process.env.TARGET,
      commitHash: process.env.COMMIT_HASH,
      builtAt: DateTime.fromISO(process.env.BUILT_AT as string).toString(),
    }
    callback()
  } else {
    console.warn(`Goqoo JS code "${entryName}" is already runnning. The second and subsequent codes will be skipped!`)
  }
}
