import express from 'express'
import * as R from 'ramda'
import { catchErrors } from '../handlers'
import { reqUser } from './helpers'
import {  getInstanceRunnersForUser } from '../database'
import { config } from '../globals'
import { createNewRunner } from '../docker'

const router = express.Router()

// @api GET /api/instanceRunners
// Retrieve all instance runners in the database and configured system default runners.
//
// Returns 200 OK and a JSON array of all instance runners or the system runners if
//   a) the user doesn't have any custom runners or
//   b) the user isn't authenticated properly
router.get('/', catchErrors(async (req, res) => {
  const { users } = await reqUser(req)
  const instanceRunners = []
  for (const [userId] of R.toPairs(users)) {
    try {
      instanceRunners.push(...await getInstanceRunnersForUser(userId))
    } catch (error) { /* ignore */ }
  }

  // join the user's custom runners with the system-provided ones
  instanceRunners.push(...config.runners)
  res.send(instanceRunners)
}))

// @api POST /api/instanceRunners/new
// Create a new instance runner for the user. The image is pulled from the Docker Hub.
// There is currently no limitations on how large or many images a user can pull.
//
// Example request body:
// @json {
//  "tag": "nginx:latest"
// }
//
// Always returns 200 OK. Readiness should be monitored from `/api/instanceRunners`
// in the `status` field.
router.post('/new', catchErrors(async (req, res) => {
  const user = await reqUser(req)
  await createNewRunner(user.userId, req.body.tag, req.body.name)
  res.sendStatus(200)
}))

module.exports = router
