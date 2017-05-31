'use babel'

import AbstractProvider from '../abstract'
import getCommit from './get-commit'
import getBlame from './get-blame'

export default class SvnProvider extends AbstractProvider {
  blame (callback) {
    if (this.exists()) {
      return getBlame(this.filePath, callback)
    }
    callback(null)
  }

  getCommit (hash, callback) {
    getCommit(this.filePath, hash, callback)
  }
}
