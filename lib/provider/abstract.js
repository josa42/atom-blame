'use babel'

import fs from 'fs'

export default class AbstractProvider {
  constructor (filePath, type) {
    this.filePath = filePath
    this.type = type
  }

  supports (type) {
    return false
  }

  blame (callback) {}

  getCommit (hash, callback) {}

  getCommitLink (hash, callback) {}

  dependenciesExist () {
    return this.filePath && fs.existsSync(this.filePath)
  }

  exists () {
    return this.filePath && fs.existsSync(this.filePath)
  }
}
