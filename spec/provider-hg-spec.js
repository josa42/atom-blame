'use babel'

import path from 'path'
import async from './utils/async'
import { cloneHg } from './utils/fixture-repos'
import providerFactory from '../lib/provider/factory'

const filePath = path.join(__dirname, 'fixtures', 'hg-repo', 'README.md')
const provider = providerFactory(filePath)

beforeEach(async(() => cloneHg()))

describe('Blame (hg)', () => {
  it('should blame readme', async((done) => {
    if (process.env.SKIP_HG_TESTS) {
      return done()
    }

    provider.blame((result) => {
      expect(result).not.toBe(null)
      expect(result[1]).toEqual({
        rev: 'af5a6975413a',
        author: { name: 'Josa Gesell' },
        date: '2016-02-18T22:25:28.000Z',
        line: '1'
      })
      done()
    })
  }))
})
