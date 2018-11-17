const childProcess = require('child_process')
const meta = require('./meta-util')

function execProcess(command) {
  return childProcess.execSync(command).toString().trim()
}

const gitHash = execProcess('git rev-parse HEAD')
const gitBranch = execProcess('git rev-parse --abbrev-ref HEAD')

module.exports = meta.json({ gitHash, gitBranch })

