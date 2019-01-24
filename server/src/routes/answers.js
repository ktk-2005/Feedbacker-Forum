import express from 'express'
import {
  addAnswer,
} from '../database'
import { uuid, attempt, reqUser } from './helpers'
import { catchErrors } from '../handlers'

const router = express.Router()

// @api POST /api/answers
// adds answer to database
//
// Returns `{ id }` of the added answer
router.post('/', catchErrors(async (req, res) => {
  const { questionId, blob } = req.body
  const { userId } = await reqUser(req)

  await attempt(async () => {
    const id = uuid()
    await addAnswer({
      id, userId, questionId, blob: JSON.stringify(blob),
    })
    res.json({ id })
  })
}))
