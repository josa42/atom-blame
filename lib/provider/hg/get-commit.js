"use babel"

const exec = require('child_process').exec;
const path = require('path');
import moment from 'moment'

import CommitCache from '../../utils/commit-cache'

const cache = new CommitCache()

export default function getCommit(file, revision, callback) {

  const cached = cache.get(file, revision)

  if (cached) { return callback(cached) }

  const realFile = path.basename(file);
  const cwd = path.dirname(file);

  exec(`hg log --verbose --rev ${revision}`, { cwd }, (error, stdout, stderr) => {

    if (error) { return }

    const authorMatch = stdout.match(/\nuser:\s+(.*) <(.*)>\n/) || []
    const dateStr = stdout.match(/\ndate:\s+(.*)\n/)[1]
    const description = (stdout.split(/\ndescription:\n/)[1] || '').split('\n')

    const author = authorMatch[1]
    const email = authorMatch[2]
    const date = moment(new Date(dateStr)).format('YYYY-MM-DD HH:mm:ss')
    const subject = description.shift()
    const message = description.join('\n').replace(/(^\s+|\s+$)/, '')

    const commit = { email, subject, author, message }

    cache.set(file, revision, commit)

    callback(commit)
  });
}
