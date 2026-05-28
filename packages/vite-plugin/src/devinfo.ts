import { execSync } from 'node:child_process'

export type DevInfo = {
  nodeEnv: string
  commitHash: string
  builtAt: string
}

const safeCommitHash = (): string => {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return 'unknown'
  }
}

export const resolveDevInfo = (mode: string): DevInfo => ({
  nodeEnv: mode,
  commitHash: safeCommitHash(),
  builtAt: new Date().toISOString(),
})
