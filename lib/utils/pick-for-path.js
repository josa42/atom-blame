'use babel'

import path from 'path'

module.exports = function pickForPath (currentPath, callback) {
  let lastPath
  while (currentPath && lastPath !== currentPath) {
    lastPath = currentPath
    currentPath = path.dirname(currentPath)

    const response = callback(currentPath)
    if (response) {
      return response
    }
  }

  return null
}
