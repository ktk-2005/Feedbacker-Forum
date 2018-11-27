import express from 'express'
import { uuid } from './helpers'
import { addUser, getUsers } from '../database'
import { catchErrors } from '../handlers'

const router = express.Router()

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


router.get('/', catchErrors(async (req, res) => {
  await getUsers().then((rows) => {
    res.send(rows)
  })
}))


module.exports = router