'use babel'

import moment from 'moment'
import Blamer from 'blamer'
import AbstractProvider from '../abstract'
import getCommit from './get-commit'

let blamers = new Blamer('svn')

export default class SvnProvider extends AbstractProvider {
  blame (callback) {
    blamers.blameByFile(this.filePath).then(
      (result) => callback(cleanUp(result[this.filePath])),
      (error) => console.error(error) || callback(null)
    )
  }

  getCommit (hash, callback) {
    getCommit(this.filePath, hash, callback)
  }
}

function cleanUp (result) {
  Object.keys(result).forEach((key) => {
    result[key].date = moment(result[key].date).format('YYYY-MM-DD HH:mm:ss ZZ')
  })

  return result
}
