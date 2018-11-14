import express from 'express'
import childProcess from 'child_process'

const app = express()
export default app

// Run a process `command` and asynchronously return standard outputs.
function execProcess(command) {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, (error, stdout, stderr) => {
      if (error) reject(error)
      else resolve({ stdout, stderr })
    })
  })
}

app.get('/api/version', async (req, res) => {
  const { stdout: hash } = await execProcess('git rev-parse HEAD')
  const { stdout: branch } = await execProcess('git rev-parse --abbrev-ref HEAD')

  res.send({
    gitHash: hash.trim(),
    gitBranch: branch.trim(),
  })
})
