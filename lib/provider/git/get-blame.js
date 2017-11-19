'use babel'

import moment from 'moment'
import gitBlame from 'git-blame'
import findRepo from '../../utils/find-repo'

export default function getBlame (filePath, callback) {
  const repoPath = findRepo(filePath)
  const basePath = repoPath.replace(/\.git$/, '')
  filePath = filePath.replace(basePath, '')

  const commits = {}
  const lines = []

  gitBlame(repoPath, {
    file: filePath,
    rev: 'HEAD',
    ignoreWhitespace: atom.config.get('blame.ignoreWhitespace'),
    detectMoved: atom.config.get('blame.detectMoved'),
    detectCopy: atom.config.get('blame.detectCopy')
  })
    .on('data', (type, data) => {
      if (type === 'commit') {
        commits[data.hash] = data
      } else {
        lines.push(data)
      }
    })
    .on('error', (err) => console.error(filePath, err) || callback(null))
    .on('end', () => {
      const result = lines
        .sort((a, b) => Number(a.finalLine) - Number(b.finalLine))
        .reduce((result, { finalLine: line, hash: rev }) => {
          const { author: { name, timestamp } } = commits[rev]

          const date = moment.unix(timestamp).toISOString()

          result[line] = { author: { name }, date, line, rev }

          return result
        }, {})

      callback(result)
    })
}
