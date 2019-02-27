import express from 'express'
import * as R from 'ramda'
import {
  createNewContainer,
  startContainer,
  stopContainer,
  deleteContainer,
  getContainerLogs,
  getRunningContainersByUser,
} from '../docker'
import { resolveContainer, addSite, listContainersByUser, confirmContainerOwnership } from '../database'
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
    url, version, type, name, port,
  } = req.body

  const { userId } = await reqUser(req)

  if (!url) {
    throw new HttpError(400, 'No git url given')
  }
  if (!version && type !== 'site') {
    throw new HttpError(400, 'No git version given')
  }
  if (name.length < 3 || name.length > 20) {
    throw new HttpError(400, `Name too short or long: ${name}`)
  }
  if (!name.match(/[a-z0-9](-?[a-z0-9])*/)) {
    throw new HttpError(400, `Bad container name: ${name}`)
  }

  if (type === 'site') {
    await attempt(async () => {
      const subdomain = `${name}-${uuid(5)}`
      const id = uuid(8)
      const containerInfo = await addSite({
        id, subdomain, userId, type, url,
      })
      res.json({ containerInfo })
    })
  } else {
    await attempt(async () => {
      const suffixedName = `${name}-${uuid(5)}`
      const containerInfo = await createNewContainer(
        url, version, type, suffixedName, port, userId
      )
      res.json({ containerInfo })
    })
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
