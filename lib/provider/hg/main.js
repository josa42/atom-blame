"use babel"

import Blamer from 'blamer'
import AbstractProvider from '../abstract'
import getCommit from './get-commit'
import getBlame from './get-blame'

let blamers = new Blamer('svn')

export default class HgProvider extends AbstractProvider {

  supports(type) {
    return ['copy'].indexOf(type) !== -1
  }

  blame(callback) {
    getBlame(this.filePath, callback)
  }

  getCommit(hash, callback) {
    getCommit(this.filePath, hash, callback)
  }
}
