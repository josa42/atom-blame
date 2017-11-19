'use babel'

import path from 'path'
import async from './utils/async'
import { cloneSvn } from './utils/fixture-repos'
import providerFactory from '../lib/provider/factory'

const filePath = path.join(__dirname, 'fixtures', 'svn-repo', 'trunk', 'README.md')
const provider = providerFactory(filePath)

beforeEach(async(() => cloneSvn()))

describe('Blame (svn)', () => {
  it('should blame readme', async((done) => {
    if (process.env.SKIP_SVN_TESTS) {
      return done()
    }

    provider.blame((result) => {
      expect(result).not.toBe(null)
      expect(result[1]).toEqual({
        rev: '2',
        author: { name: 'josa42' },
        date: '2017-05-31T11:39:33.765Z',
        line: '1'
      })
      expect(result[2]).toEqual({
        rev: '3',
        author: { name: 'josa42' },
        date: '2017-05-31T11:39:56.797Z',
        line: '2'
      })
      expect(result[3]).toEqual({
        rev: '4',
        author: { name: 'josa42' },
        date: '2017-05-31T11:40:43.029Z',
        line: '3'
      })

      done()
    })
  }))
})
