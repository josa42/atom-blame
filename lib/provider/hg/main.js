"use babel"

import Blamer from 'blamer'
import AbstractProvider from '../abstract'
import getCommit from './get-commit'
import getBlame from './get-blame'

let blamers = new Blamer('svn')

export default class HgProvider extends AbstractProvider {

  blame(callback) {
    getBlame(this.filePath, callback)
  }

  getCommit(hash, callback) {
    getCommit(this.filePath, hash, callback)
  }
}
