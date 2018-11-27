import express from 'express'
import { uuid } from './helpers'
import { addUser, getUsers } from '../database'

const router = express.Router()

router.post('/', async (req, res) => {
  const { name } = req.body
  const id = uuid()
  // Will be stored as JSON in production, as string in sqlite
  const keys = {
    key: uuid(8),
    secret: uuid(30),
  }
  const keyString = JSON.stringify(keys)
  await addUser([id, name, keyString])
  res.send('👌')
})


router.get('/', (req, res) => {
  getUsers().then((rows) => {
    res.send(rows)
  }, (err) => {
    console.error(err)
  })
})


module.exports = router
