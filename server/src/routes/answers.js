import express from 'express'
import {
  addAnswer, getAnswer,
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

// @api GET /api/answers/:questionId
// Returns answer of a user for specific question
router.get('/:questionId', catchErrors(async (req, res) => {
  const { questionId } = req.params
  const { userId } = await reqUser(req)

  await attempt(async () => {
    const answer = await getAnswer({ userId, questionId })
    res.send(answer.map(a => ({
      id: a.id,
      time: a.time,
      userId: a.user_id,
      questionId: a.question_id,
      blob: JSON.parse(a.blob),
    })))
  })
}))

module.exports = router
