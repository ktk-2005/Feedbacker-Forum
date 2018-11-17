const childProcess = require('child_process')

function execProcess(command) {
  return childProcess.execSync(command).toString().trim()
}

const gitHash = execProcess('git rev-parse HEAD')
const gitBranch = execProcess('git rev-parse --abbrev-ref HEAD')

const result = { gitHash, gitBranch }
module.exports = () => ({
  code: `module.exports = ${JSON.stringify(result)}`,
})

