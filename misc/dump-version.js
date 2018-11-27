#!/usr/bin/env node

const childProcess = require('child_process')

function execProcess(command) {
  return childProcess.execSync(command).toString().trim()
}

const gitHash = execProcess('git rev-parse HEAD')
const gitBranch = execProcess('git rev-parse --abbrev-ref HEAD')
process.stdout.write(JSON.stringify({ gitHash, gitBranch }))
process.stdout.write('\n')
