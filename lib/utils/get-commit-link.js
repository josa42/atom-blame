"use babel"

import findRepo from './find-repo'
import Git from 'git-wrapper'
import configs from '../config/provider'

 function parseRemote(remote, config) {
  for (let exp of config.exps) {
    let m = remote.match(exp)
    if (m) {
      return { protocol: m[1], host: m[2], user: m[3], repo: m[4] }
    }
  }

  return null
}

function buildLink(remote, hash, config) {
  data = parseRemote(remote, config)
  if (data) {
    return config.template
      .replace('{protocol}', data.protocol || 'https')
      .replace('{host}', data.host)
      .replace('{user}', data.user)
      .replace('{repo}', data.repo)
      .replace('{hash}', hash)
  }

  return null
}

function getConfig(git, key, callback) {
  git.exec('config', { get: true }, [ key ], callback)
}

function getCommitLink(file, hash, callback) {
  let repoPath = findRepo(file)
  if (!repoPath) {
    return
  }

  let git = new Git({ 'git-dir': repoPath })
  getConfig(git, 'atom-blame.browser-url', (error, url) => {

    if (url) {
      let link = url
        .replace(/(^\s+|\s+$)/g, '')
        .replace('{hash}', hash)

      if (link) {
        return callback(link)
      }
    }

    getConfig(git, 'remote.origin.url', (error, remote) => {

      if (error) { return console.error(error) }

      remote = remote.replace(/(^\s+|\s+$)/g, '')

      for (let config of configs) {
        link = buildLink(remote, hash, config)
        if (link) {
          return callback(link)
        }
      }

      callback(null)
    })
  })
}

export default getCommitLink
