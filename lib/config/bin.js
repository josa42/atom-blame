'use babel'

export function hg () {
  return process.env.TEST_HG_BIN || 'hg'
}

export function svn () {
  return process.env.TEST_SVN_BIN || 'svn'
}

export function git () {
  return process.env.TEST_GIT_BIN || 'git'
}
