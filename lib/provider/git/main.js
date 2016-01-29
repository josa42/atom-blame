"use babel"

import Blamer from 'blamer'
import getCommit from './get-commit'
import getCommitink from './get-commit-link'
import AbstractProvider from '../abstract'

let blamers = new Blamer('git')

export default class GitProvider extends AbstractProvider {

  supports(type) {
    return ['copy', 'link'].indexOf(type) !== -1
  }

  blame(callback) {
    blamers.blameByFile(this.filePath).then(
      (result) => callback(result[this.filePath]),
      (error) => callback(null)
    )
  }

  getCommit(hash, callback) {
    getCommit(this.filePath, hash, callback)
  }

  getCommitLink(hash, callback) {
    getCommitLink(this.filePath, hash, callback)
  }
}
