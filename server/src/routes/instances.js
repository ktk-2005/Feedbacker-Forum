import express from 'express'
import {
  getRunningContainers, createNewContainer, stopContainer, deleteContainer
} from '../docker'

const router = express.Router()


// @api GET /api/containers
// Retrieve all instances in the database.
//
// Returns 200 OK and a JSON array of all instances or 500 ISE if an error occurred.

router.get('/', async (req, res) => {
  try {
    const containers = await getRunningContainers()
    res.send(containers)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})

// @api POST /api/containers/new
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
    console.log(req.body)
    await createNewContainer(req.body.instance_image)
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})

// @api POST /api/containers/stop
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

// @api POST /api/containers/delete
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
