'use babel'

import gitBlame from 'git-blame'
import getCommit from './get-commit'
import getCommitLink from './get-commit-link'
import AbstractProvider from '../abstract'
import findRepo from '../../utils/find-repo'

export default class GitProvider extends AbstractProvider {
  supports (type) {
    return ['copy', 'link'].indexOf(type) !== -1
  }

  blame (callback) {
    const repoPath = findRepo(this.filePath)
    const basePath = repoPath.replace(/\.git$/, '')
    const filePath = this.filePath.replace(basePath, '')

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
      .on('error', (err) => console.error(err) || callback(null))
      .on('end', () => {
        const result = lines
          .sort((a, b) => Number(a.finalLine) - Number(b.finalLine))
          .reduce((result, { finalLine: line, hash: rev }) => {
            const { author: { name, mail, timestamp } } = commits[rev]

            result[line] = { line, author: `${name} <${mail}>`, timestamp, rev }

            return result
          }, {})

        callback(result)
      })
  }

  getCommit (hash, callback) {
    getCommit(this.filePath, hash, callback)
  }

  getCommitLink (hash, callback) {
    getCommitLink(this.filePath, hash, callback)
  }
}
