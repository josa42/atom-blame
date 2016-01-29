"use babel"

import findRepo from './find-repo'
import Git from 'git-wrapper'

const showOpts = {
  s: true,
  format: '%ce%n%cn%n%B'
}

const cache = {}

function getCache(file, hash) {
  return cache[`${file}|${hash}`] || null
}

function setCache(file, hash, msg) {
  cache[`${file}|${hash}`] = msg
}

function getCommitMessage(file, hash, callback) {
  const repoPath = findRepo(file)

  if (!repoPath) { return; }

  const git = new Git({ 'git-dir': repoPath })
  git.exec('show', showOpts, [ hash ], (error, msg) => {
    if (error) { return }
    callback(msg)
  })
}

function getCommit(file, hash, callback) {
  const cached = getCache(file, hash)

  if (cached) { return callback(cached) }

  getCommitMessage(file, hash, (msg) => {

    const lines = msg.split(/\n/g)

    const commit = {
      email: lines.shift(),
      author: lines.shift(),
      subject: lines.shift(),
      message: lines.join('\n').replace(/(^\s+|\s+$)/, '')
    }

    setCache(file, hash, commit)

    callback(commit)
  })
}


module.exports = getCommit
