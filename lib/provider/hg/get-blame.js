"use babel"

import { exec } from 'child_process'
import moment from 'moment'
import path from 'path'

const cache = {}

function getCache(file, revision) {
  return cache[`${file}|${revision}`] || null
}

function setCache(file, revision, msg) {
  cache[`${file}|${revision}`] = msg
}

export default function getBlame(filePath, callback) {

  const fileName = path.basename(filePath);
  const cwd = path.dirname(filePath);

  exec(`hg annotate --user -v --number --date --line-number --changeset ${fileName}`, { cwd }, (error, stdout, stderr) => {

    if (error) { return }

    let lines = {}

    stdout.split('\n').forEach((lineStr) => {

      let matches = lineStr.match(/(.*) <(.*)> (\d+) ([a-z0-9]+) (.*):(\d+): /)

      if (!matches) { return }

      const rev = matches[4];
      const author = matches[1];
      const date = moment(new Date(matches[5])).format('YYYY-MM-DD HH:mm:ss')
      const line = matches[6];

      const commit = { rev, author, date, line }

      lines[line] = commit
    })

    callback(lines)
  });
}
