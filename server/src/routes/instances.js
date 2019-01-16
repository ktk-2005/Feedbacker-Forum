import express from 'express'
import {
  getRunningContainers, createNewContainer, stopContainer, deleteContainer
} from '../docker'

const router = express.Router()


// @api GET /api/containers
// TODO

router.get('/', async (req, res) => {
  try {
    const containers = await getRunningContainers()
    res.send(containers)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})

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

router.post('/stop', async (req, res) => {
  try {
    await stopContainer(req.body.instance_id)
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})


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
