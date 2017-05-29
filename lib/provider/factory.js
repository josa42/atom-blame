'use babel'

import fs from 'fs'
import path from 'path'
import findRepoType from '../utils/find-repo-type'

export default function (filePath) {
  const type = findRepoType(filePath)

  if (!type) { return null }

  const providerPath = path.join(__dirname, type, 'main.js')

  if (fs.existsSync(providerPath)) {
    const Provider = require(providerPath)
    return new Provider(filePath, type)
  }
}
