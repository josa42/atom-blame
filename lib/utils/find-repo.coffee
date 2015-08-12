path = require 'path'
fs = require 'fs'

findRepo = (cpath) ->
  while cpath and lastPath isnt cpath
    lastPath = cpath
    cpath = path.dirname cpath

    rpath = path.join(cpath, '.git')
    return rpath if fs.existsSync rpath

  return null

module.exports = findRepo
