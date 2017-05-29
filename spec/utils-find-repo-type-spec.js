'use babel'

import path from 'path'
import async from './utils/async'
import { cloneAll } from './utils/fixture-repos'
import findRepoType from '../lib/utils/find-repo-type'

beforeEach(async(() => cloneAll()))

describe('findRepoType()', () => {
  it('should detect git repo', () => {
    const filePath = path.join(__dirname, 'fixtures', 'git-repo', 'README.md')
    const type = findRepoType(filePath)
    expect(type).toBe('git')
  })

  it('should detect svn repo', () => {
    const filePath = path.join(__dirname, 'fixtures', 'svn-repo', 'trunk', 'README.md')
    const type = findRepoType(filePath)
    expect(type).toBe('svn')
  })

  it('should detect hg repo', () => {
    const filePath = path.join(__dirname, 'fixtures', 'hg-repo', 'README.md')
    const type = findRepoType(filePath)
    expect(type).toBe('hg')
  })
})
