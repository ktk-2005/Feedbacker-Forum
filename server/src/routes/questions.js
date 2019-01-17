/* eslint-disable camelcase */
import express from 'express'
import {
  getQuestions, addQuestion, addThread
} from '../database'
import { uuid, attempt, reqUser, reqContainer } from './helpers'
import { catchErrors } from '../handlers'

const router = express.Router()

// @api GET /api/questions
// Retrieve all questions in the current container instance.
//
// returns JSON array of all questions in database
router.get('/', catchErrors(async (req, res) => {
  const questions = await getQuestions()
  res.send(questions.map(r => ({
    id: r.id,
    time: r.time,
    text: r.text,
    userID: r.user_id,
    threadID: r.thread_id,
    blob: r.blob,
  })))
}))

// @api POST /api/questions
// adds question to database.
//
// Example body @json {
//   "text": "What?",
//   "blob": {"path": "/path/to/element"}
// }
//
// Returns `{ id }` of the created question
router.post('/', catchErrors(async (req, res) => {
  const { text, blob } = req.body
  const { userId } = await reqUser(req)
  const { container } = await reqContainer(req)

  const threadId = req.body.threadId || await attempt(async () => {
    const threadId = uuid()
    await addThread({
      id: threadId, container,
    })
    return threadId
  })

  await attempt(async () => {
    const id = uuid()
    await addQuestion({
      id, text, userId, threadId, blob: JSON.stringify(blob),
    })
    res.json({ id })
  })
}))

module.exports = router
