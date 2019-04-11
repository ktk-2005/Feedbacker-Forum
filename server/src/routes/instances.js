import express from 'express'
import * as R from 'ramda'
import bcrypt from 'bcrypt'
import { http, https } from 'follow-redirects'
import { URL } from 'url'
import {
  createNewContainer,
  startContainer,
  stopContainer,
  deleteContainer,
  getContainerLogs,
  getRunningContainersByUser,
} from '../docker'
import { addSite, confirmContainerOwnership } from '../database'
import { attempt, uuid, reqUser } from './helpers'
import { catchErrors } from '../handlers'
import { HttpError } from '../errors'
import logger from '../logger'

const router = express.Router()

function followRedirects(targetUrl) {
  return new Promise((resolve, reject) => {
    const client = targetUrl.startsWith('https') ? https : http
    const request = client.get(targetUrl, (response) => {
      const url = new URL(response.responseUrl)
      request.abort()
      resolve({
        protocol: url.protocol,
        host: url.host,
        path: `${url.pathname}${url.search || ''}${url.hash || ''}`,
      })
    })

    request.setTimeout(20000, () => {
      reject(new HttpError(400, `Could not resolve URL, timed out: ${targetUrl}`))
    })

    request.on('error', (error) => {
      reject(new HttpError(400, `Could not resolve URL: ${targetUrl}`, error))
    })
  })
}

// @api GET /api/instances
// Retrieve all instances in the database.
//
// Returns 200 OK and a JSON array of all instances or 500 ISE if an error occurred.
router.get('/', catchErrors(async (req, res) => {
  const { users } = await reqUser(req)
  const containers = []
  for (const [userId] of R.toPairs(users)) {
    containers.push(...await getRunningContainersByUser([userId]))
  }
  res.send(containers)
}))

// @api GET /api/instances/logs/:name
// Retrieve logs of an instance.
//
// Returns 200 OK and a string with logs or 500 ISE if an error occurred.
router.get('/logs/:name', catchErrors(async (req, res) => {
  const { name } = req.params
  const { users } = await reqUser(req)

  await confirmContainerOwnership(name, users)

  const logs = await getContainerLogs(name)
  res.type('txt')
  res.send(logs)
}))
// @api POST /api/instances/new
// Create a new instance.
//
// Currently the only parameter considered is `instance_image`. The name and subdomain are
// generated automatically.
//
// Example body @json {
//  "type": "node"
// }
//
// Returns 200 OK if the operation completed successfully and 500 ISE if an error occurred.
router.post('/new', catchErrors(async (req, res) => {
  const {
    url, envs, type, name, port, password,
  } = req.body

  const { userId, users } = await reqUser(req)

  if (name.length < 3 || name.length > 20) {
    throw new HttpError(400, `Name too short or long: ${name}`)
  }

  if (!name.match(/[a-z0-9](-?[a-z0-9])*/)) {
    throw new HttpError(400, `Bad container name: ${name}`)
  }

  let hashedPassword
  if (password) {
    if (password.length < 5 || password.length > 64) {
      throw new HttpError(400, 'Password is too short or long. Minimum length is 5 and maximum length is 64.')
    }

    /* ***************** */
    /*  IMPORTANT STUFF  */
    /* ***************** */
    hashedPassword = await bcrypt.hash(password, 10)
  }

  if (type === 'site') {
    const finalUrl = await followRedirects(url)

    const rootUrl = `${finalUrl.protocol}//${finalUrl.host}`
    const redirectPath = finalUrl.path

    await attempt(async () => {
      const subdomain = `${name}-${uuid(5)}`
      const id = uuid(64)
      const containerInfo = await addSite({
        id,
        subdomain,
        userId,
        type,
        url: rootUrl,
        origin: rootUrl,
        blob: JSON.stringify({ path: redirectPath }),
      })
      res.json({ containerInfo, redirectPath })
    })
  } else if (type === 'node-runner') {
    if (!envs || !envs.GIT_CLONE_URL || !envs.GIT_VERSION_HASH) {
      throw new HttpError(400, 'Type `application` requires the following environment variables to be set: `GIT_CLONE_URL` and `GIT_VERSION_HASH`')
    }

    await attempt(async () => {
      const suffixedName = `${name}-${uuid(5)}`
      const containerInfo = await createNewContainer(
        envs, type, suffixedName, port, userId, Object.keys(users), hashedPassword
      )
      res.json({ containerInfo })
    })
  } else {
    throw new HttpError(400, `Unsupported type: "${type}"`)
  }
}))

// @api POST /api/instances/stop
// Stop a running container.
//
// Example body @json {
//  "name": "testapp-ab012"
// }
//
// Returns 200 OK if the operation completed successfully and 500 ISE if an error occurred.
router.post('/stop', catchErrors(async (req, res) => {
  const { name } = req.body
  const { users } = await reqUser(req)

  await confirmContainerOwnership(name, users)

  await stopContainer(name)
  logger.info(`Stopped container with name ${name}`)
  res.send({})
}))

// @api POST /api/instances/start
// Start a stopped container.
//
// Example body @json {
//  "name": "testapp-ab012"
// }
//
// Returns 200 OK if the operation completed successfully and 500 ISE if an error occurred.
router.post('/start', catchErrors(async (req, res) => {
  const { name } = req.body
  const { users } = await reqUser(req)

  await confirmContainerOwnership(name, users)

  await startContainer(name)
  logger.info(`Started container with name ${name}`)
  res.send({})
}))

// @api POST /api/instances/delete
// Delete a container
//
// Example body @json {
//  "name": "testapp-ab012"
// }
//
// Returns 200 OK if the operation completed successfully and 500 ISE if an error occurred.
router.post('/delete', catchErrors(async (req, res) => {
  const { name } = req.body
  const { users } = await reqUser(req)

  await confirmContainerOwnership(name, users)

  await deleteContainer(name)
  logger.info(`Deleted container with name ${name}`)
  res.send({})
}))

module.exports = router
