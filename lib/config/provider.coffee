module.exports = [{
  exps: [
    /^git@github\.com:(.+)\/(.+)\.git$/,
    /^https:\/\/github\.com\/(.+)\/(.+)\.git$/
  ]
  template: "https://github.com/{user}/{repo}/commit/{hash}"
},{
  exps: [
    /^git@bitbucket\.org:(.+)\/(.+)\.git$/
    /^https:\/\/.+@bitbucket\.org\/(.+)\/(.+)\.git$/
  ]
  template: "https://bitbucket.org/{user}/{repo}/commits/{hash}"
}]
