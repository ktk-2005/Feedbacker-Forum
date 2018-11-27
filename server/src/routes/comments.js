/* eslint-disable camelcase */
import express from 'express'
import { getComments, getThreadComments, addComment, addThread } from '../database'
import { uuid, attempt } from './helpers'
import { catchErrors } from '../handlers'

const router = express.Router()

// @api GET /api/comments
// Retrieve all comments.
//
// returns JSON array of all comments in database
router.get('/', catchErrors(async (req, res) => {
  res.send(await getComments())
}))

// @api POST /api/comments
// Adds comment to database.
//
// Example body @json {
//   "text": "minttua",
//   "user": "salaattipoika",
//   "container": "abcdef",
//   "blob": "{\"path\": \"/path/to/element\"}"
// }
//
// Returns 'OK' if comment is succesfully added
router.post('/', catchErrors(async (req, res) => {
  const { text, user, blob } = req.body

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
    await addComment({
      id, text, user, threadId, blob,
    })
    res.send('OK')
  })
}))

// @api GET /api/comments/:threadId
// Get comments by threadId
//
// returns JSON array of all comments in thread
router.get('/:threadId', catchErrors(async (req, res) => {
  const { threadId } = req.params
  res.send(await getThreadComments(threadId))
}))

module.exports = router
