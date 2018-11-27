/* eslint-disable camelcase */
import express from 'express'
import { getQuestions, addQuestion } from '../database'
import { uuid } from './helpers'
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
// Returns 'OK' if question is succesfully added
router.post('/', catchErrors(async (req, res) => {
  const { text, userId, blob } = req.body
  const id = uuid()
  const threadId = req.body.threadId || uuid()
  await addQuestion({
    id, text, userId, threadId, blob,
  })
  res.send('OK')
}))

module.exports = router
