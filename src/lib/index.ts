export * from './types'

export const goqoo = (entryName: string, callback: () => void): void => {
  if (!window.goqoo) {
    window.goqoo = {}
  }

  if (!window.goqoo[entryName]) {
    window.goqoo[entryName] = true
    callback()
  } else {
    console.warn(`Goqoo JS code "${entryName}" is already runnning. The second and subsequent codes will be skipped!`)
  }
}
