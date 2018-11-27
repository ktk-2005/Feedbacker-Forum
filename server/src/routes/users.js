import express from 'express'
import { uuid } from './helpers'
import { addUser, getUsers } from '../database'

const router = express.Router()

router.post('/', async (req, res) => {
  const { name } = req.body
  const id = uuid()
  // Will be stored as JSON in production, as string in sqlite
  const secret = uuid(30)
  await addUser([id, name, secret])
  res.json({
    id: id,
    secret: secret
  })
})


router.get('/', async (req, res) => {
  await getUsers().then((rows) => {
    res.send(rows)
  })
})


module.exports = router
