/* eslint-disable camelcase */
import express from 'express'
import {
  getQuestions,
  getQuestionsWithAnswers,
  addQuestion,
  editQuestion,
  removeQuestion,
  reorderQuestions,
  getQuestionHighestOrder,
} from '../database'
import { uuid, attempt, reqUser, reqContainer } from './helpers'
import { catchErrors } from '../handlers'
import { HttpError } from '../errors'

const router = express.Router()

// @api GET /api/questions
// Retrieve all questions in the current container instance.
//
// returns JSON array of all questions of instance
router.get('/', catchErrors(async (req, res) => {
  const { container, owner } = await reqContainer(req)
  const { users } = await reqUser(req)

  const isOwner = users.hasOwnProperty(owner) || container.includes('-')

  const questions = (isOwner ? await getQuestionsWithAnswers(container)
    : await getQuestions(container))

  res.json(questions)
}))

function validateQuestion(question) {
  if (question.text.match(/^\s*$/)) throw new HttpError(400, 'Empty question')
  if (!['text', 'option', 'info'].includes(question.type)) throw new HttpError(400, 'Bad question type')
}

function extractBlob(question) {
  const blob = { }
  if (question.type === 'option') blob.options = question.options
  return blob
}

// @api POST /api/questions
// adds question to database.
//
// Example body @json {
//   "text": "What do you think?",
//   "type": "text"
// }
//
// Returns `{ id }` of the created question
router.post('/', catchErrors(async (req, res) => {
  const { text, type } = req.body || { }
  const { userId, users } = await reqUser(req)
  const { container, owner } = await reqContainer(req)

  if (!users.hasOwnProperty(owner) && !container.includes('-')) {
    throw new HttpError(403, 'Only instance owner can create questions')
  }

  const order = await getQuestionHighestOrder(container) + 1

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
      order,
      blob: JSON.stringify(blob),
    })
    res.json({ id })
  })
}))

// @api DELETE /api/questions/:id
// Delete a previously posted question
router.delete('/:id', catchErrors(async (req, res) => {
  const { id } = req.params
  const { users } = await reqUser(req)
  const { container, owner } = await reqContainer(req)

  if (!users.hasOwnProperty(owner) && !container.includes('-')) {
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
  const { users } = await reqUser(req)
  const { container, owner } = await reqContainer(req)

  if (!users.hasOwnProperty(owner) && !container.includes('-')) {
    throw new HttpError(403, 'Only instance owner can edit questions')
  }

  validateQuestion(req.body)
  const blob = extractBlob(req.body)

  await editQuestion({
    id,
    text,
    type,
    blob: JSON.stringify(blob),
  })

  res.json({ id })
}))

// @api POST /api/questions/order
// Re-order questions, accepts a body like @json {
//   order: ['id-1', 'id-2', 'id-3']
// }
router.post('/order', catchErrors(async (req, res) => {
  const { order } = req.body || { }
  const { users } = await reqUser(req)
  const { container, owner } = await reqContainer(req)

  if (!users.hasOwnProperty(owner) && !container.includes('-')) {
    throw new HttpError(403, 'Only instance owner can edit questions')
  }
  if (!Array.isArray(order)) throw new HttpError(400, 'Expected order array')

  await reorderQuestions(order)

  res.json({ })
}))


module.exports = router
