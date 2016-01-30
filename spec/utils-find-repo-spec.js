"use babel";

import fs  from 'fs';
import path from 'path';
import Git from 'git-wrapper';
import rmdir from './utils/rmdir';
import async from './utils/async';
import findRepo from '../lib/utils/find-repo';

import { cloneAll, cleanAll } from './utils/fixture-repos';

let testRepo = 'git@github.com:OliverLetterer/dummy-repo.git';

describe('utils/find-repo', () => {

  let repoPath = path.join(__dirname, 'fixtures', 'git-repo');
  let gitDirPath = path.join(repoPath, '.git');

  beforeEach(async(() => cloneAll()))
  // afterEach(() => cleanAll())

  describe('findRepo()', () => {

    it('return repo path for directory', () => {
      let rpath = findRepo(repoPath);
      expect(rpath).toBe(gitDirPath);
    });

    it('return repo path for filename', () => {
      let rpath = findRepo(path.join(repoPath, 'README.md'));
      expect(rpath).toBe(gitDirPath);
    });

  });
});
