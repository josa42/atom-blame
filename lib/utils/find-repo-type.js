'use babel'

import path from 'path'
import fs from 'fs'
import pickForPath from './pick-for-path'

const types = ['git', 'svn', 'hg']

module.exports = function findRepoType (filePath) {
  return pickForPath(filePath, (currentPath) => {
    const type = types.find((type) => {
      return fs.existsSync(path.join(currentPath, `.${type}`))
    })

    if (type) { return type }
  })
}
