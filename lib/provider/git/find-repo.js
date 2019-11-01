'use babel'

import path from 'path'
import fs from 'fs'
import pickForPath from '../../utils/pick-for-path'

module.exports = function findRepo (filePath) {
  return pickForPath(filePath, (currentPath) => {
    const repoPath = path.join(currentPath, '.git')

    if (fs.existsSync(repoPath)) {
      return repoPath
    }
  })
}
