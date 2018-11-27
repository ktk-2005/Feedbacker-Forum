import express from 'express'
import childProcess from 'child_process'
import fs from 'fs'
import { promisify } from 'util'

const router = express.Router()

const readFile = promisify(fs.readFile)

// Run a process `command` and asynchronously return standard outputs.
function execProcess(command) {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, (error, stdout, stderr) => {
      if (error) reject(error)
      else resolve({ stdout, stderr })
    })
  })
}

let version = null

async function getVersion() {
  if (version) return version

  try {
    const file = await readFile('build/version.json')
    version = JSON.parse(file)
    return version
  } catch (e) { /* ignore */ }

  try {
    const { stdout } = await execProcess('node ../misc/dump-version.js')
    version = JSON.parse(stdout)
    return version
  } catch (e) { /* ignore */ }

  console.error('Failed to fetch current version')
  version = { }
  return version
}

// @api GET /api/version
// Retrieve version information about the running server.
//
// Example response @json {
//   "gitHash": "331d54dc84a46d12e15bdc9e7b16aacf2f2741a9",
//   "gitBranch": "develop"
// }
router.get('/', async (req, res) => {
  const result = await getVersion()
  res.send(result)
})

module.exports = router

