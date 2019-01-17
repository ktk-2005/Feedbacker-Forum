import express from 'express'
import * as R from 'ramda'
import {
  // getRunningContainers,
  getRunningContainersByUser,
  createNewContainer,
  stopContainer,
  deleteContainer,
  getContainerLogs,
} from '../docker'
import { verifyUser } from '../database'
import { attempt, uuid } from './helpers'

const router = express.Router()


// @api GET /api/instances
// Retrieve all instances in the database.
//
// Returns 200 OK and a JSON array of all instances or 500 ISE if an error occurred.
/*
router.get('/', async (req, res) => {
  try {
    const containers = await getRunningContainers()
    res.send(containers)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})
*/
router.get('/', async (req, res) => {
  try {
    const [type, token] = req.get('Authorization').split(' ')
    // let users = JSON.parse(atob(token))
    let users = JSON.parse(Buffer.from(token, 'base64').toString())
    users = R.toPairs(users)
    const containers = []
    for (const [userId, secret] of users) {
      try {
        await verifyUser(userId, secret)
        containers.push(...await getRunningContainersByUser([userId]))
      } catch (error) { /* ignore */ }
    }
    res.send(containers)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})

// @api GET /api/instances/logs
// Retrieve logs of an instance.
//
// Returns 200 OK and a string with logs or 500 ISE if an error occurred.
router.get('/logs/:id', async (req, res) => {
  try {
    const logs = await getContainerLogs(req.params.id)
    res.type('txt')
    res.send(logs)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})

// @api POST /api/instances/new
// Create a new container.
//
// Currently the only parameter considered is `instance_image`. The name and subdomain are
// generated automatically.
//
// Example body @json {
//  "instance_image": "nginx"
// }
//
// Returns 200 OK if the operation completed successfully and 500 ISE if an error occurred.
router.post('/new', async (req, res) => {
  try {
    const {
      url, version, type, name, port, userId,
    } = req.body
    if (type === 'node') {
      await attempt(async () => {
        const suffixedName = `${name}-${uuid(5)}`
        const containerInfo = await createNewContainer(
          url, version, type, suffixedName, port, userId
        )
        res.json({ containerInfo })
      })
    } else {
      console.log(`/api/instances/new -- expected type 'node', but got '${type}'`)
      res.sendStatus(501)
    }
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})

// @api POST /api/instances/stop
// Stop a running container.
//
// Example body @json {
//  "id": "212ef098098a098b0980c980980"
// }
//
// Returns 200 OK if the operation completed successfully and 500 ISE if an error occurred.
router.post('/stop', async (req, res) => {
  try {
    await stopContainer(req.body.instance_id)
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})

// @api POST /api/instances/delete
// Delete a container
//
// Example body @json {
//  "id": "212ef098098a098b0980c980980"
// }
//
// Returns 200 OK if the operation completed successfully and 500 ISE if an error occurred.
router.post('/delete', async (req, res) => {
  try {
    await deleteContainer(req.body.intance_id)
    res.send(200)
  } catch (error) {
    console.log(error)
    res.send(500)
  }
})

module.exports = router
