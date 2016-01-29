"use babel"

export default class AbstractProvider {

  constructor(filePath, type) {
    this.filePath = filePath
    this.type = type
  }

  supports(type) {
    return false
  }

  blame(callback) {}

  getCommit(hash, callback) {}

  getCommitLink(hash, callback) {}
}
