'use babel'

import { exec } from 'child_process'
import moment from 'moment'
import path from 'path'

import { hg } from '../../config/bin'

export default function getBlame (filePath, callback) {
  const fileName = path.basename(filePath)
  const cwd = path.dirname(filePath)

  exec(`${hg()} annotate --user -v --number --date --line-number --changeset ${fileName}`, { cwd }, (error, stdout, stderr) => {
    if (error) {
      console.error(error)
      return
    }

    const lines = {}

    stdout.split('\n').forEach((lineStr) => {
      const matches = lineStr.match(/(.*) <(.*)> (\d+) ([a-z0-9]+) (.*):(\d+): /)

      if (!matches) { return }

      const rev = matches[4]
      const name = matches[1]
      const date = moment(new Date(matches[5])).toISOString()
      const line = matches[6]

      const commit = { rev, author: { name }, date, line }

      lines[line] = commit
    })

    callback(lines)
  })
}
