import express from 'express'
import { uuid, attempt } from './helpers'
import { addUser, addUsername } from '../database'
import { uuid, attempt, reqUser, reqContainer } from './helpers'
import { addUser, addUsername } from '../database'
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

    await addUser({ id, name, secret })
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
//    "id": "d6ac55e9",
//    "secret": "ea2ca2565f484906bfd5096126816a"
// }
// Returns 'ok' if the change was successful.
//
router.put('/', catchErrors(async (req, res) => {
  const { name, id, secret } = req.body

  await attempt(async () => {
    const updated = await addUsername({ name, id, secret })
    res.json('ok')
  })
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

// @api PUT /api/users
// Change username of existing user.
// The request requires the id, the secret and the new username for the user,
// eg. @json {
//    "name": "Testuser2",
//    "id": "d6ac55e9",
//    "secret": "ea2ca2565f484906bfd5096126816a"
// }
// Returns 'ok' if the change was successful.
//
router.put('/', catchErrors(async (req, res) => {
  const { name, id, secret } = req.body

  await attempt(async () => {
    await addUsername({ name, id, secret })
    res.json('ok')
  })
}))

module.exports = router
