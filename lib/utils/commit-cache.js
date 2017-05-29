'use babel'

export default class CommitCache {
  constructor () {
    this.cache = {}
  }

  get (file, hash) {
    return this.cache[`${file}|${hash}`] || null
  }

  set (file, hash, msg) {
    this.cache[`${file}|${hash}`] = msg
  }
}
