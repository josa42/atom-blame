"use babel"

import Blamer from 'blamer'
let blamer = null

export default function (file, args, callback) {

  if (!blamer) {
    blamer = new Blamer('git')
  }


  blamer.blameByFile(file, args).then(
    (result) => callback(result[file]),
    (error) => callback(null)
  )
}
