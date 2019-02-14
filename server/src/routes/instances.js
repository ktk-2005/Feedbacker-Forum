import express from 'express'
import * as R from 'ramda'
import {
  // getRunningContainers,
  getRunningContainersByUser,
  createNewContainer,
  startContainer,
  stopContainer,
  deleteContainer,
  getContainerLogs,
} from '../docker'
import { verifyUser, resolveContainer, addSite } from '../database'
import { attempt, uuid, reqUser } from './helpers'
import { catchErrors } from '../handlers'
import { HttpError } from '../errors'
import logger from '../logger'

const router = express.Router()


// @api GET /api/instances
// Retrieve all instances in the database.
//
// Returns 200 OK and a JSON array of all instances or 500 ISE if an error occurred.
router.get('/', catchErrors(async (req, res) => {
  const { users } = await reqUser(req)
  const containers = []
  for (const [userId, secret] of R.toPairs(users)) {
    try {
      await verifyUser(userId, secret)
      containers.push(...await getRunningContainersByUser([userId]))
    } catch (error) { /* ignore */ }
  }
  res.send(containers)
}))

// @api GET /api/instances/logs/:name
// Retrieve logs of an instance.
//
// Returns 200 OK and a string with logs or 500 ISE if an error occurred.
router.get('/logs/:name', catchErrors(async (req, res) => {
  const { users } = await reqUser(req)
  const { id, userId } = await resolveContainer(req.params.name)

  if (!users.hasOwnProperty(userId)) {
    throw new HttpError(403, 'Only instance owner can see logs')
  }

  const logs = await getContainerLogs(id)
  res.type('txt')
  res.send(logs)
}))

// @api POST /api/instances/new
// Create a new container.
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
    url, version, type, name, port,
  } = req.body

  const { userId } = await reqUser(req)

  if (!url) {
    throw new HttpError(400, 'No git url given')
  }
  // if (!version) {
  //   throw new HttpError(400, 'No git version given')
  // }
  if (name.length < 3 || name.length > 20) {
    throw new HttpError(400, `Name too short or long: ${name}`)
  }
  if (!name.match(/[a-z0-9](-?[a-z0-9])*/)) {
    throw new HttpError(400, `Bad container name: ${name}`)
  }

  if (type === 'node') {
    await attempt(async () => {
      const suffixedName = `${name}-${uuid(5)}`
      const containerInfo = await createNewContainer(
        url, version, type, suffixedName, port, userId
      )
      res.json({ containerInfo })
    })
  } else if (type === 'site') {
    const subdomain = `${name}-${uuid(5)}`
    const id = 'aaaabbbb'
    console.log(id, subdomain, userId, url)
    const containerInfo = await addSite({
      id, subdomain, userId, url,
    })
    res.json({ containerInfo })
  } else {
    throw new HttpError(501, `Expected type 'node', but got '${type}'`)
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
  await stopContainer(req.body.name)
  logger.info(`Stopped container with name ${req.body.name}`)
  res.sendStatus(200)
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
  await startContainer(req.body.name)
  logger.info(`Started container with name ${req.body.name}`)
  res.sendStatus(200)
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
  await deleteContainer(req.body.name)
  logger.info(`Deleted container with name ${req.body.name}`)
  res.send(200)
}))

module.exports = router
