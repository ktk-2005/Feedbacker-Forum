import express from 'express'
import childProcess from 'child_process'
import { checkInt, checkBool } from './check'
import { config } from './setup'

// Run a process `command` and asynchronously return standard outputs.
function execProcess(command) {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, (error, stdout, stderr) => {
      if (error) reject(error)
      else resolve({ stdout, stderr })
    })
  })
}

export function startServer() {

  const app = express()

  if (checkBool('dev', config.dev)) {
    console.log('Running as development server')
    app.use(express.static('../client/build'))
    app.use(express.static('../misc'))
  }

  app.get('/api/version', async (req, res) => {
    const { stdout: hash } = await execProcess('git rev-parse HEAD')
    const { stdout: branch } = await execProcess('git rev-parse --abbrev-ref HEAD')

    res.send({
      gitHash: hash.trim(),
      gitBranch: branch.trim(),
    })
  })

  const port = checkInt('port', config.port)
  app.listen(port, () => {
    console.log(`Running on port ${port}`)
  })
}

