/* eslint-disable camelcase */
import express from 'express'
import {
  getQuestions, addQuestion, editQuestion, addThread, removeQuestion
} from '../database'
import { uuid, attempt, reqUser, reqContainer } from './helpers'
import { catchErrors } from '../handlers'
import HttpError from '../http-error.js'

const router = express.Router()

// @api GET /api/questions
// Retrieve all questions in the current container instance.
//
// returns JSON array of all questions in database
router.get('/', catchErrors(async (req, res) => {
  const { container } = await reqContainer(req)
  const questions = await getQuestions(container)
  res.send(questions.map(r => ({
    id: r.id,
    time: r.time,
    text: r.text,
    userId: r.user_id,
    type: r.type,
    ...JSON.parse(r.blob),
  })))
}))

function validateQuestion(question) {
  if (question.text.match(/^\s*$/)) throw new HttpError(400, 'Empty question')
  if (!['text', 'option', 'info'].includes(question.type)) throw new HttpError(400, 'Bad question type')
}

function extractBlob(question) {
  const blob = { }
  if (question.type === 'option')
    blob.options = question.options
  return blob
}

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
  const { text, type } = req.body || { }
  const { userId } = await reqUser(req)
  const { container, containerOwner } = await reqContainer(req)

  if (userId != containerOwner && !container.includes('-')) {
    throw new HttpError(403, 'Only instance owner can create questions')
  }

  validateQuestion(req.body)
  const blob = extractBlob(req.body)

  await attempt(async () => {
    const id = uuid()
    await addQuestion({
      id,
      text: text || '',
      type: type || 'text',
      userId,
      container,
      blob: JSON.stringify(blob),
    })
    res.json({ id })
  })
}))

// @api DELETE /api/questions/:id
// Delete a previously posted question
router.delete('/:id', catchErrors(async (req, res) => {
  const { id } = req.params
  const { userId } = await reqUser(req)
  const { container, containerOwner } = await reqContainer(req)

  if (userId != containerOwner && !container.includes('-')) {
    throw new HttpError(403, 'Only instance owner can delete questions')
  }

  await removeQuestion({ id })

  res.json({ id })
}))

// @api PUT /api/questions/:id
// Update a previously posted question
router.put('/:id', catchErrors(async (req, res) => {
  const { text, type } = req.body || { }
  const { id } = req.params
  const { userId } = await reqUser(req)
  const { container, containerOwner } = await reqContainer(req)

  if (userId != containerOwner && !container.includes('-')) {
    throw new HttpError(403, 'Only instance owner can edit questions')
  }

  validateQuestion(req.body)
  const blob = extractBlob(req.body)

  await editQuestion({
    id,
    text: text,
    type: type,
    blob: JSON.stringify(blob),
  })

  res.json({ id })
}))

module.exports = router
