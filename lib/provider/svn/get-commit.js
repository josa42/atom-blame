"use babel"

const exec = require('child_process').exec;
const path = require('path');

import CommitCache from '../../utils/commit-cache'

const cache = new CommitCache()

export default function getCommit(file, revision, callback) {

  const cached = cache.get(file, revision)

  if (cached) { return callback(cached) }

  const realFile = path.basename(file);
  const cwd = path.dirname(file);

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
  });
}
