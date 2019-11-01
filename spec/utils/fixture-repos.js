'use babel'

import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import Git from 'git-wrapper'
import rmdir from './rmdir'

import { hg, svn } from '../../lib/config/bin'

const git = new Git()

// const gitRepoUrl = 'git@github.com:OliverLetterer/dummy-repo.git';
const gitRepoUrl = 'https://github.com/OliverLetterer/dummy-repo.git'
const svnRepoUrl = 'https://svn.code.sf.net/p/atom-blame-svn-fixture/code/'
const hgRepoUrl = 'https://josa@bitbucket.org/josa/fixture-hg-repo'
const fixturePath = path.join(__dirname, '..', 'fixtures')

let createdRepos = []

function dirExists (dirPath) {
  try {
    return fs.lstatSync(dirPath).isDirectory()
  } catch (e) {
    return false
  }
}

function createFixtureDir (dirPath) {
  if (!dirExists(fixturePath)) {
    fs.mkdirSync(fixturePath)
  }
  process.chdir(fixturePath)
}

async function execCmd (cmd, { ignoreStderr = false } = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, { fixturePath }, (error, stdout, stderr) => {
      if (error || (!ignoreStderr && stderr)) { return reject(error || new Error(stderr)) }
      resolve()
    })
  })
}

export async function cloneGit () {
  if (createdRepos.indexOf('git') === -1) {
    createdRepos.push('git')

    createFixtureDir()
    rmdir('git-repo')

    return new Promise((resolve, reject) => {
      console.log('git clone ' + gitRepoUrl)
      git.exec('clone', {}, [gitRepoUrl, 'git-repo'], (err, msg) => {
        if (err) { return reject(err) }
        resolve()
      })
    })
  }

  return Promise.resolve()
}

export async function cloneHg () {
  if (createdRepos.indexOf('hg') === -1) {
    createdRepos.push('hg')

    createFixtureDir()
    rmdir('hg-repo')

    console.log(`${hg()} clone ${hgRepoUrl}`)
    return execCmd(`${hg()} clone --insecure ${hgRepoUrl} hg-repo`, { ignoreStderr: true })
  }
  return Promise.resolve()
}

export async function cloneSvn () {
  if (createdRepos.indexOf('svn') === -1) {
    createdRepos.push('svn')

    createFixtureDir()
    rmdir('svn-repo')

    console.log(`${svn()} co ${svnRepoUrl}`)
    return execCmd(`${svn()} co ${svnRepoUrl} svn-repo`)
  }
  return Promise.resolve()
}

export function cloneAll () {
  return Promise.all([
    cloneGit(),
    cloneSvn(),
    cloneHg()
  ])
}

export function cleanAll () {
  createdRepos = []
  rmdir(fixturePath)
}
