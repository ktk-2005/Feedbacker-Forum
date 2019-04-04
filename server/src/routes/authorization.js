import express from 'express'
import { HttpError } from '../errors'
import { catchErrors } from '../handlers'
import { reqUser } from './helpers'
import { authorizeUserForContainer } from '../authorization'
import { getAuthorizationToken } from '../database'

const router = express.Router()

// @api POST /api/authorization/retry
// Retrieve an existing authentication if one exists.
// Required fields in the body: [subdomain]
// Example request: @json {
//   "subdomain": "hello-world-abcd23"
// }
//
// Example response body @json {
//   "authToken": "0123456789abcdef"
// }
//
// Returns 200 OK with auth token if the authorization was succesful.
// Returns 401 if the user is not authorized yet.
router.post('/retry', catchErrors(async (req, res) => {
  const { userId } = await reqUser(req)
  const { subdomain } = req.body

  const authToken = await getAuthorizationToken(subdomain, userId)
  if (!authToken) {
    throw new HttpError(401, 'User is not authenticated')
  }

  res.send({ authToken })
}))

// @api POST /api/authorization
// Authorize user for accessing the specified container.
// Required fields in the body: [password, subdomain]
// Example request: @json {
//   "password": "correct horse battery staple",
//   "subdomain": "hello-world-abcd23"
// }
//
// Example response body @json {
//   "authToken": "0123456789abcdef"
// }
//
// Returns 200 OK with auth token if the authorization was succesful.
// Returns 403 if the authorization was not succesful.
router.post('/', catchErrors(async (req, res) => {
  const { userId } = await reqUser(req)
  const { password, subdomain } = req.body

  const authToken = await authorizeUserForContainer(userId, password, subdomain)

  res.send({ authToken })
}))

module.exports = router
