import express from 'express'
import { uuid } from './helpers'
import { addUser, getUsers } from '../database'
import { catchErrors } from '../handlers'

const router = express.Router()

// @api POST /api/users
// Add user to database.
// Returns JSON that contains generated id and secret of added user.
//
// @params @json {
//   "name": "salaattipoika"
// }
//
// Example response @json {
//     "id": "d6ac55e9",
//     "secret": "ea2ca2565f484906bfd5096126816a"
// }
router.post('/', catchErrors(async (req, res) => {
  const { name } = req.body
  const id = uuid()
  // Will be stored as JSON in production, as string in sqlite
  const secret = uuid(30)
  await addUser([id, name, secret])
  res.json({
    id,
    secret,
  })
}))


module.exports = router
