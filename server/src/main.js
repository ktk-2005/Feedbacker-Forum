import express from 'express'
import childProcess from 'child_process'

const app = express()

// Run a process `command` and asynchronously return standard outputs.
function execProcess(command) {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, (error, stdout, stderr) => {
      if (error) reject(error)
      else resolve({ stdout, stderr })
    })
  })
}

app.use(express.static('../client/build'))
app.use(express.static('../misc'))

app.get('/api/version', async (req, res) => {
  const { stdout: hash } = await execProcess('git rev-parse HEAD')
  const { stdout: branch } = await execProcess('git rev-parse --abbrev-ref HEAD')

  res.send({
    gitHash: hash.trim(),
    gitBranch: branch.trim(),
  })
})

const port = 8080
app.listen(port, () => {
  console.log(`Running on port ${port}`)
})

