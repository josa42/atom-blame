'use babel'

import { exec } from 'child_process'
import path from 'path'
import moment from 'moment'

import { hg } from '../../config/bin'

import CommitCache from '../../utils/commit-cache'

const cache = new CommitCache()

export default function getCommit (file, revision, callback) {
  const cached = cache.get(file, revision)

  if (cached) { return callback(cached) }

  const cwd = path.dirname(file)

  exec(`${hg()} log --verbose --rev ${revision}`, { cwd }, (error, stdout, stderr) => {
    if (error) {
      console.error(error)
      return
    }

    const authorMatch = stdout.match(/\nuser:\s+(.*) <(.*)>\n/) || []
    const dateStr = stdout.match(/\ndate:\s+(.*)\n/)[1]
    const description = (stdout.split(/\ndescription:\n/)[1] || '').split('\n')

    const name = authorMatch[1]
    const email = authorMatch[2]
    const date = moment(new Date(dateStr)).format('YYYY-MM-DD HH:mm:ss')
    const subject = description.shift()
    const message = description.join('\n').replace(/(^\s+|\s+$)/, '')

    const commit = { subject, author: { name, email }, message, date }

    cache.set(file, revision, commit)

    callback(commit)
  })
}
