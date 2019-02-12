import express from 'express'
import { addUser, addUsername } from '../database'
import { uuid, attempt, reqUser, reqContainer } from './helpers'
import { HttpError } from '../errors'

import { catchErrors } from '../handlers'

const router = express.Router()

// @api POST /api/users
// Add user to database.
// Returns JSON that contains generated id and secret of added user.
// The body can be empty to create a new anonymous user which is the default
// mode of interaction in the frontend.
// Alternatively you can specify properties for the new user, eg. @json {
//   "name": "salaattipoika"
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
    res.json({
      id,
      secret,
    })
  })
}))

// @api PUT /api/users
// Change username of existing user.
// The request requires the id, the secret and the new username for the user,
// eg. @json {
//    "name": "Testuser2",
// }
router.put('/', catchErrors(async (req, res) => {
  const { users } = await reqUser(req)
  const name = req.body.name.trim()
  if (!name) throw new HttpError(400, 'Empty username')

  let anySuccess = false
  for (const id in users) {
    const secret = users[id]
    try {
      await attempt(async () => {
        await addUsername({ name, id, secret })
      })
      anySuccess = true
    } catch (error) {
      console.error(`Failed to change username for ${id}`, error)
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
