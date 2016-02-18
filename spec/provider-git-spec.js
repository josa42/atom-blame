"use babel"

import path from 'path'
import async from './utils/async'
import { cloneGit } from './utils/fixture-repos';
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
          rev: '^1c24e9d'
        },
        2: {
          author: 'Yovoslav Ivanov',
          date: '2015-08-03 10:02:12 +0200',
          line: '2',
          rev: '6ef63d49'
        },
        3: {
          author: 'Yovoslav Ivanov',
          date: '2015-08-03 10:03:21 +0200',
          line: '3',
          rev: '629e4543'
        }
      })

      done()
    })
  }))
})
