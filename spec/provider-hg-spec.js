"use babel"

import path from 'path'
import async from './utils/async'
import { cloneSvn } from './utils/fixture-repos';
import providerFactory from '../lib/provider/factory'

const filePath = path.join(__dirname, 'fixtures', 'hg-repo', 'README.md')
const provider = providerFactory(filePath)

beforeEach(async(() => cloneSvn()))

describe('Blame (hg)', () => {
  it('should blame readme', async((done) => {

    provider.blame((result) => {
      expect(result).toEqual({
        1: {
          author: 'Josa Gesell',
          date: '2016-02-18 23:25:28',
          line: '1',
          rev: 'af5a6975413a'
        }
      })
      done()
    })
  }))
})
