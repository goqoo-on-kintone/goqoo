require('isomorphic-fetch')
const { Dropbox } = require('dropbox')
const path = require('path')

// TODO: 設定ファイルで変更できるようにしたい
const RETRY_LIMIT = 60

const sleep = milliSec => new Promise(resolve => setTimeout(resolve, milliSec))
module.exports = class DropboxKintone {
  constructor ({ accessToken, localRootDir }) {
    this.dbx = new Dropbox({ accessToken })
    this.localRootDir = localRootDir
  }

  async fetchSharedLink (filePath, retryCount = 0) {
    try {
      const { url } = await this.dbx.sharingCreateSharedLink({ path: filePath })
      return {
        localPath: path.join(this.localRootDir, filePath),
        dropboxUrl: url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', ''),
      }
    } catch (e) {
      if (e.error && e.error.error_summary && e.error.error_summary.includes('path/not_found')) {
        if (retryCount <= RETRY_LIMIT) {
          console.error(`${filePath}: Not synced yet. Retrying...`)
          await sleep(1000)
          return this.fetchSharedLink(filePath, retryCount + 1)
        } else {
          console.error(`Over retry limit: ${RETRY_LIMIT}`)
        }
      }
      console.error(e)
      Promise.reject(e)
    }
  }

  async fetchSharedLinks (filePaths) {
    return Promise.all(filePaths.map(filePath => this.fetchSharedLink(filePath)))
  }
}
