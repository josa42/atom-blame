'use babel'

import moment from 'moment'
import Blamer from 'blamer'

const blamer = new Blamer('svn')

export default function getBlame (filePath, callback) {
  blamer.blameByFile(filePath).then(
    (result) => callback(cleanUp(result[filePath])),
    (error) => console.error(error) || callback(null)
  )
}

function cleanUp (result) {
  if (result) {
    Object.keys(result).forEach((key) => {
      result[key].date = moment(result[key].date).toISOString()
      const name = result[key].author
      result[key].author = { name }
    })
  }

  return result
}
