'use babel'

import Git from 'git-wrapper'
import findRepo from './find-repo'
import CommitCache from '../../utils/commit-cache'

const cache = new CommitCache()

const showOpts = {
  s: true,
  format: '%ae%n%an%n%ce%n%cn%n%B'
}

function getCommitMessage (file, hash, callback) {
  const repoPath = findRepo(file)

  if (!repoPath) { return }

  const git = new Git({ 'git-dir': repoPath })
  git.exec('show', showOpts, [hash], (error, msg) => {
    if (error) { return }
    callback(msg)
  })
}

function getCommit (file, hash, callback) {
  const cached = cache.get(file, hash)

  if (cached) { return callback(cached) }

  getCommitMessage(file, hash, (msg) => {
    const lines = msg.split(/\n/g)

    const commit = {
      author: { email: lines.shift(), name: lines.shift() },
      committer: { email: lines.shift(), name: lines.shift() },
      subject: lines.shift(),
      message: lines.join('\n').replace(/(^\s+|\s+$)/, '')
    }

    cache.set(file, hash, commit)

    callback(commit)
  })
}

module.exports = getCommit
