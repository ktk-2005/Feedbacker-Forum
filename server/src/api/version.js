import express from 'express'
import childProcess from 'child_process'
const router = express.Router()

export default router

// Run a process `command` and asynchronously return standard outputs.
function execProcess(command) {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, (error, stdout, stderr) => {
      if (error) reject(error)
      else resolve({ stdout, stderr })
    })
  })
}

// @api GET /api/version
// Retrieve version information about the running server.
//
// Example response @json {
//   "gitHash": "331d54dc84a46d12e15bdc9e7b16aacf2f2741a9",
//   "gitBranch": "develop"
// }
router.get('/', async (req, res) => {
  const { stdout: hash } = await execProcess('git rev-parse HEAD')
  const { stdout: branch } = await execProcess('git rev-parse --abbrev-ref HEAD')

  res.send({
    gitHash: hash.trim(),
    gitBranch: branch.trim(),
  })
})

router.post('/', (req, res) => { })
