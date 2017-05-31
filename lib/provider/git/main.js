'use babel'

import getBlame from './get-blame'
import getCommit from './get-commit'
import getCommitLink from './get-commit-link'
import AbstractProvider from '../abstract'

export default class GitProvider extends AbstractProvider {
  supports (type) {
    return ['copy', 'link'].indexOf(type) !== -1
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

  getCommitLink (hash, callback) {
    getCommitLink(this.filePath, hash, callback)
  }
}
