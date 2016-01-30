"use babel"

import fs  from 'fs';
import path from 'path';
import { exec } from 'child_process'
import Git from 'git-wrapper';
import rmdir from './rmdir';

const git = new Git()

const gitRepoUrl = 'git@github.com:OliverLetterer/dummy-repo.git';
const svnRepoUrl = 'https://github.com/OliverLetterer/dummy-repo';
const hgRepoUrl = 'ssh://hg@bitbucket.org/josa/fixture-hg-repo';
const fixturePath = path.join(__dirname, '..', 'fixtures')

let createdRepos

function execCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { fixturePath }, (error, stdout, stderr) => {

      if (stderr) { return reject(new Error(stderr)) }

      resolve()
    })
  });
}

export function cloneGit() {

  return new Promise((resolve, reject) => {

    git.exec('clone', {}, [ gitRepoUrl, 'git-repo' ], (err, msg) => {
      if (err) { return reject(err) }
      resolve();
    })
  })
}

export function cloneHg() {
  return execCmd(`hg clone ${hgRepoUrl} hg-repo`)
}

export function cloneSvn() {
  return execCmd(`svn co ${svnRepoUrl} svn-repo`)
}


export function cloneAll () {

  if (createdRepos) {
    return Promise.resolve()
  }

  createdRepos = true

  cleanAll()

  const currentPath = process.cwd()
  fs.mkdirSync(fixturePath)
  process.chdir(fixturePath)

  return Promise
    .all([ cloneGit(), cloneSvn(), cloneHg() ])
    .then(() => process.chdir(currentPath))
}

export function cleanAll () {
  rmdir(fixturePath)
}
