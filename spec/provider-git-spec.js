'use babel'

import path from 'path'
import async from './utils/async'
import { cloneGit } from './utils/fixture-repos'
import providerFactory from '../lib/provider/factory'

const filePath = path.join(__dirname, 'fixtures', 'git-repo', 'README.md')
const provider = providerFactory(filePath)

beforeEach(async(() => cloneGit()))

describe('Blame (git)', () => {
  it('should blame readme', async((done) => {
    provider.blame((result) => {
      expect(result).toEqual({
        1: {
          author: 'Oliver Letterer',
          date: '2015-08-03 09:54:04 +0200',
          line: '1',
          rev: '1c24e9d8b068176e5eb43a8ca66e03e1ddb14ac8'
        },
        2: {
          author: 'Yovoslav Ivanov',
          date: '2015-08-03 10:02:12 +0200',
          line: '2',
          rev: '6ef63d4955aca9c1960b558f039c46f1745be40b'
        },
        3: {
          author: 'Yovoslav Ivanov',
          date: '2015-08-03 10:03:21 +0200',
          line: '3',
          rev: '629e4543a010628af5099945b8c927712c081eb6'
        }
      })

      done()
    })
  }))
})
