findRepo = require './find-repo'
Git = require 'git-wrapper'
configs = require '../config/provider.coffee'

parseRemote = (remote, config) ->
  for exp in config.exps
    m = remote.match(exp)
    return { host: m[1], user: m[2], repo: m[3] } if m

  return null

getLink = (remote, hash, config) ->
  if data = parseRemote(remote, config)
    return config.template
      .replace('{host}', data.host)
      .replace('{user}', data.user)
      .replace('{repo}', data.repo)
      .replace('{hash}', hash)

  return null

getCommitLink = (file, hash, callback) ->
  repoPath = findRepo(file)

  return unless repoPath

  git = new Git('git-dir': repoPath)
  git.exec 'config', get: true, ['remote.origin.url'], (error, remote) ->
    return console.error(error) if error

    remote = remote.replace(/(^\s+|\s+$)/g, '')

    for config in configs
      link = getLink(remote, hash, config)
      return callback(link) if link

    callback(null)


module.exports = getCommitLink
