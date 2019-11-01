module.exports = [{
  // Bitbucket
  exps: [
    /^(?<protocol>)(?<sshuser>git)@(?<host>bitbucket\.org):(?<user>[^/]+)\/(?<repo>[^/.]+)\.git$/,
    /^(?<protocol>https?)(?<sshuser>):\/\/(?<host>bitbucket\.org)\/(?<user>[^/]+)\/(?<repo>[^/.]+)(\.git)?$/,
    /^(?<protocol>https?)(?<sshuser>):\/\/.+@(?<host>bitbucket\.org)\/(?<user>[^/]+)\/(?<repo>[^/.]+)(\.git)?$/
  ],
  template: '{protocol}://{host}/{user}/{repo}/commits/{long-hash}'
}, {
  // ViualStudio Online
  exps: [
    /^(?<protocol>)(?<sshuser>[^@]+)@vs-ssh\.(?<host>visualstudio\.com):v3\/(?<organization>[^/]+)\/(?<user>[^/]+)\/(?<repo>[^/.]+)(\.git)?$/
  ],
  template: '{protocol}://{organization}.{host}/{user}/_git/{repo}/commit/{long-hash}'
}, {
  // Generic (Github, GitLab and others)
  exps: [
    /^(?<protocol>)(?<sshuser>git)@(?<host>.*):(?<user>.+)\/(?<repo>.+)\.git$/,
    /^(?<protocol>https?)(?<sshuser>):\/\/(?<host>[^@/]+)\/(?<user>[^/]+)\/(?<repo>[^/.]+)(\.git)?$/,
    /^(?<protocol>https?):\/\/(?<sshuser>.+)@(?<host>[^/]+)\/(?<user>[^/]+)\/(?<repo>[^/.]+)(\.git)?$/
  ],
  template: '{protocol}://{host}/{user}/{repo}/commit/{long-hash}'
}]
