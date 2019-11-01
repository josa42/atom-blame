'use babel'

import Git from 'git-wrapper'

import findRepo from './find-repo'
import configs from '../../config/url-schemes'

function parseRemote (remote, config) {
  for (const exp of config.exps) {
    const m = remote.match(exp)
    if (m) {
      return m.groups
    }
  }

  return null
}

function buildLink (remote, hash, config) {
  const data = parseRemote(remote, config)
  if (data) {
    return config.template
      .replace('{protocol}', data.protocol || 'https')
      .replace('{host}', data.host)
      .replace('{organization}', data.organization)
      .replace('{user}', data.user)
      .replace('{repo}', data.repo)
      .replace('{hash}', hash.substr(0, 8))
      .replace('{long-hash}', hash)
  }

  return null
}

function getConfig (git, key, callback) {
  git.exec('config', { get: true }, [key], callback)
}

export default function getCommitLink (file, hash, callback) {
  const repoPath = findRepo(file)
  if (!repoPath) {
    return
  }

  const git = new Git({ 'git-dir': repoPath })

  getConfig(git, 'atom-blame.browser-url', (error, url) => {
    if (!error && url) {
      const link = url
        .replace(/(^\s+|\s+$)/g, '')
        .replace('{hash}', hash.substr(0, 8))
        .replace('{long-hash}', hash)

      if (link) {
        return callback(link)
      }
    }

    getConfig(git, 'remote.origin.url', (error, remote) => {
      if (error) { return console.error(error) }

      remote = remote.replace(/(^\s+|\s+$)/g, '')
      for (const config of configs) {
        const link = buildLink(remote, hash, config)
        if (link) {
          return callback(link)
        }
      }

      callback(null)
    })
  })
}
