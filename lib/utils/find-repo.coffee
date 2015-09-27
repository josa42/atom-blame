path = require 'path'
fs = require 'fs'

findRepo = (cpath) ->

  while cpath and lastPath isnt cpath

    rpath = path.join(cpath, '.git')

    lastPath = cpath
    cpath = path.dirname cpath
    return rpath if fs.existsSync rpath

  return null

module.exports = findRepo
