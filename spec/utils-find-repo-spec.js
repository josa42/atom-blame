"use babel";

import fs  from 'fs';
import path from 'path';
import Git from 'git-wrapper';
import rmdir from './utils/rmdir';
import async from './utils/async';
import findRepo from '../lib/utils/find-repo';

let testRepo = 'git@github.com:OliverLetterer/dummy-repo.git';

describe('utils/find-repo', () => {

  process.chdir(path.join(__dirname, ''));

  let repoPath = path.join(process.cwd(), 'test-repo');
  let gitDirPath = path.join(repoPath, '.git');

  beforeEach(async(done => {
    let git = new Git();
    git.exec('clone', {}, [testRepo, 'test-repo'], (err, msg) => {
      done();
    });
  }));

  afterEach(() => rmdir('test-repo'));

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
