"use babel"

import findRepo from './find-repo'
import Git from 'git-wrapper'

const cache = {}

function getCache(file, hash) {
  return cache[`${file}|${hash}`] || null
}

function setCache(file, hash, msg) {
  cache[`${file}|${hash}`] = msg
}

function getDiff(file, hash, callback) {

  const cached = getCache(file, hash)
  if (cached) { return callback(cached) }

  const repoPath = findRepo(file)
  if (!repoPath) { return; }

  const git = new Git({ 'git-dir': repoPath })
  git.exec('show', {}, [ hash ], function (error, diff) {
    if (error) { return console.error(error); }

    setCache(file, hash, diff)
    callback(diff)
  })
}

module.exports = getDiff
