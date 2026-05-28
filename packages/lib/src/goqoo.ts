export const goqoo = (entryName: string, callback: () => void): void => {
  window.__goqoo__ = window.__goqoo__ || {}
  if (window.__goqoo__[entryName]) {
    console.warn(`Goqoo JS code "${entryName}" is already running. The second and subsequent codes will be skipped!`)
    return
  }
  window.__goqoo__[entryName] = true
  callback()
}
