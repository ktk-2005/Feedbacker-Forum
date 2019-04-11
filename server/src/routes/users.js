import express from 'express'
import { addUser, addUsername } from '../database'
import { uuid, attempt, reqUser, reqContainer } from './helpers'
import { HttpError } from '../errors'
import { args } from '../globals'

import { catchErrors } from '../handlers'

const router = express.Router()

// @api POST /api/users
// Add user to database.
// Returns JSON that contains generated id and secret of added user.
// The body can be empty to create a new anonymous user which is the default
// mode of interaction in the frontend.
// Alternatively you can specify properties for the new user,
// eg. @json {
//   "name": "testuser"
// }
//
// Example response @json {
//     "id": "d6ac55e9",
//     "secret": "ea2ca2565f484906bfd5096126816a"
// }
router.post('/', catchErrors(async (req, res) => {
  const { name } = req.body

  await attempt(async () => {
    const id = uuid()
    const secret = uuid(30)

    await addUser({ id, secret, name: name || null })

    const token = req.signedCookies.FeedbackAuth
    let users = { }
    try {
      if (token) {
        users = JSON.parse(Buffer.from(token, 'base64').toString())
      }
    } catch (error) { /* Nop */ }

    users[id] = secret

    const newToken = Buffer.from(JSON.stringify(users), 'ascii').toString('base64')

    res.cookie('FeedbackAuth', newToken, {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 200,
      httpOnly: true,
      signed: true,
    })

    // Return the secret if running API tests as managing
    // cookie based authentication is a pain.
    const returnSecret = args.testApi || args.testAuth

    res.json({
      id,
      secret: returnSecret ? secret : 'x',
    })
  })
}))

// @api PUT /api/users
// Change username of existing user.
// The user is specified using the X-Feedback-Auth header as with other endpoints
// and the body should contain the new name eg. @json {
//    "name": "Testuser2",
// }
router.put('/', catchErrors(async (req, res) => {
  const { users } = await reqUser(req)
  const name = req.body.name.trim()
  if (!name) throw new HttpError(400, 'Empty username')

  let anySuccess = false
  for (const id in users) {
    if (users.hasOwnProperty(id)) {
      const secret = users[id]
      try {
        await addUsername({ name, id, secret })
        anySuccess = true
      } catch (error) {
        console.error(`Failed to change username for ${id}`, error)
      }
    }
  }

  if (!anySuccess) throw new HttpError(500, 'Failed to change username')

  res.json({ })
}))

// @api GET /api/users/role
// Retrieve the role of the current user in the container.
// Returns either `"dev"` or `"user"`
//
// Example body @json {
//   "role": "user"
// }
router.get('/role', catchErrors(async (req, res) => {
  const { users } = await reqUser(req)
  const { owner } = await reqContainer(req)

  res.json({
    role: users.hasOwnProperty(owner) ? 'dev' : 'user',
  })
}))

module.exports = router
