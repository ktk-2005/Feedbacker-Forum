import express from 'express'
import { catchErrors } from '../handlers'
import { reqUser } from './helpers'
import { authorizeUserForContainer } from '../authorization'

const router = express.Router()

// @api POST /api/authorization
// Authorize user for accessing the specified container.
// Required fields in the body: [password, subdomain]
// Example request: @json {
//   "password": "correct horse battery staple",
//   "subdomain": "hello-world-abcd23"
// }
//
// Returns 200 OK and an empty JSON object if the authorization was succesful.
// Returns 401 if the authorization was not succesful.
router.post('/', catchErrors(async (req, res) => {
  const { userId } = await reqUser(req)
  const { password, subdomain } = req.body

  await authorizeUserForContainer(userId, password, subdomain)

  res.send({})
}))

module.exports = router
