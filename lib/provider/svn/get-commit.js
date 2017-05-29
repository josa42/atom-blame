'use babel'

import { exec } from 'child_process'
import path from 'path'

import CommitCache from '../../utils/commit-cache'

const cache = new CommitCache()

export default function getCommit (file, revision, callback) {
  const cached = cache.get(file, revision)

  if (cached) { return callback(cached) }

  const cwd = path.dirname(file)

  exec(`svn log --revision ${revision}`, { cwd }, (error, stdout, stderr) => {
    if (error) { return }

    let lines = stdout.replace(/(^[\s-]+|[\s-]+$)/g, '').split('\n')

    const author = lines.shift().split(' | ')[1]
    lines.shift()

    const subject = lines.shift()
    const message = lines.join('\n').replace(/(^\s+|\s+$)/g, '')

    const commit = { author, subject, message }

    cache.set(file, revision, commit)

    callback(commit)
  })
}