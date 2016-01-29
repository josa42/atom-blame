"use babel"

import Blamer from 'blamer'
import AbstractProvider from '../abstract'
import getCommit from './get-commit'

let blamers = new Blamer('svn')

export default class SvnProvider extends AbstractProvider {

  blame(callback) {
    blamers.blameByFile(this.filePath).then(
      (result) => callback(result[this.filePath]),
      (error) => callback(null)
    )
  }

  getCommit(hash, callback) {
    getCommit(this.filePath, hash, callback)
  }
}
