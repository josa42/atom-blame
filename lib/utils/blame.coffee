Blamer = require 'blamer'
blamer = null

module.exports = (file, callback) ->

  blamer ?= new Blamer 'git'

  blamer.blameByFile(file).then(
    (result) -> callback(result[file])
    (error) -> callback(null)
  )
