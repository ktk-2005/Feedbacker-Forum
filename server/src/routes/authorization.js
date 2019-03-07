import express from 'express'
import { catchErrors } from '../handlers'
import { reqUser } from './helpers'
import { authorizeUserForContainer } from '../authorization'

const router = express.Router()

router.post('/', catchErrors(async (req, res) => {
  const { userId } = await reqUser(req)
  const { password, subdomain } = req.body

  await authorizeUserForContainer(userId, password, subdomain)

  res.send({})
}))

module.exports = router
