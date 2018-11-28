/* eslint-disable camelcase */
import express from 'express'
import { getQuestions, addQuestion, addThread } from '../database'
import { uuid, attempt } from './helpers'
import { catchErrors } from '../handlers'

const router = express.Router()

// @api GET /api/questions
// Retrieve all questions.
//
// returns JSON array of all questions in database
router.get('/', catchErrors(async (req, res) => {
  res.send(await getQuestions())
}))

// @api POST /api/questions
// adds question to database.
//
// Example body @json {
//   "text": "What?",
//   "user": "salaattipoika",
//   "blob": "{\"path\": \"/path/to/element\"}"
// }
//
// Returns `{ id }` of the created question
router.post('/', catchErrors(async (req, res) => {
  const { text, userId, blob } = req.body

  const threadId = req.body.threadId || await attempt(async () => {
    const threadId = uuid()
    await addThread({
      id: threadId,
      container: req.body.container,
    })
    return threadId
  })

  await attempt(async () => {
    const id = uuid()
    await addQuestion({
      id, text, userId, threadId, blob,
    })
    res.json({ id })
  })
}))

module.exports = router
