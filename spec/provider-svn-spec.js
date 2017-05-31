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
    provider.blame((result) => {
      expect(result).toEqual({
        1: {
          rev: '2',
          author: 'josa42',
          date: '2017-05-31 13:39:33 +0200',
          line: '1'
        },
        2: {
          rev: '3',
          author: 'josa42',
          date: '2017-05-31 13:39:56 +0200',
          line: '2'
        },
        3: {
          rev: '4',
          author: 'josa42',
          date: '2017-05-31 13:40:43 +0200',
          line: '3'
        }
      })

      done()
    })
  }))
})
