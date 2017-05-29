'use babel'

import fs from 'fs'
import path from 'path'

function rmdir (dir) {
  try {
    fs.accessSync(dir, fs.F_OK)
  } catch (e) {
    return
  }

  let list = fs.readdirSync(dir)

  for (let i = 0; i < list.length; i++) {
    let filename = path.join(dir, list[i])
    let stat = fs.statSync(filename)

    if (stat.isDirectory()) {
      rmdir(filename)
    } else {
      fs.unlinkSync(filename)
    }
  }

  fs.rmdirSync(dir)
}

export default rmdir
