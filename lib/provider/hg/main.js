'use babel'

import AbstractProvider from '../abstract'
import getCommit from './get-commit'
import getBlame from './get-blame'

export default class HgProvider extends AbstractProvider {
  supports (type) {
    return ['copy'].indexOf(type) !== -1
  }

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
