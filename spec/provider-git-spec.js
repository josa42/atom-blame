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
      expect(result).not.toBe(null)
      expect(result).toEqual({
        1: {
          author: { name: 'Oliver Letterer' },
          date: '2015-08-03T07:54:04.000Z',
          line: '1',
          rev: '1c24e9d8b068176e5eb43a8ca66e03e1ddb14ac8'
        },
        2: {
          author: { name: 'Yovoslav Ivanov' },
          date: '2015-08-03T08:02:12.000Z',
          line: '2',
          rev: '6ef63d4955aca9c1960b558f039c46f1745be40b'
        },
        3: {
          author: { name: 'Yovoslav Ivanov' },
          date: '2015-08-03T08:03:21.000Z',
          line: '3',
          rev: '629e4543a010628af5099945b8c927712c081eb6'
        }
      })

      done()
    })
  }))
})
