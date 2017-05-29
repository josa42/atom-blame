'use babel'

import path from 'path'
import fs from 'fs'

function findRepo (currentPath) {
  let lastPath
  while (currentPath && lastPath !== currentPath) {
    lastPath = currentPath
    currentPath = path.dirname(currentPath)

    const repoPath = path.join(currentPath, '.git')

    if (fs.existsSync(repoPath)) {
      return repoPath
    }
  }

  return null
}

module.exports = findRepo
