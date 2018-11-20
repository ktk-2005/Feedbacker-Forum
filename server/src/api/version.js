import express from 'express'
import childProcess from 'child_process'
import fs from 'fs'
import { promisify } from 'util'

const app = express()
export default app

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
  } catch (e) { }

  try {
    const { stdout } = await execProcess('node ../misc/dump-version.js')
    version = JSON.parse(stdout)
    return version
  } catch (e) { }

  return { }
}

app.get('/api/version', async (req, res) => {
  const version = await getVersion()
  res.send(version)
})
