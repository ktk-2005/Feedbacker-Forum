/* eslint-disable camelcase */
import express from 'express'
import {
  getComments, getQuestions, getReactions, getThreadComments,
  getCommentReactions, addReaction, addQuestion, addComment
} from '../database'
import { uuid } from './helpers'
import { catchErrors } from '../handlers'

const router = express.Router()

// @api GET /api/comments
// Retrieve all comments.
//
// returns JSON array of all comments in database
router.get('/comments', catchErrors(async (req, res) => {
  await getComments().then((rows) => {
    res.send(rows)
  })
}))

// @api POST /api/comments
// Adds comment to database.
//
// @params @json {
//   "text": "minttua",
//   "user": "salaattipoika",
//   "blob": "{\"path\": \"/path/to/element\"}"
// }
//
// @returns 'OK' if comment is succesfully added
router.post('/comments', catchErrors(async (req, res) => {
  const { text, user, blob } = req.body
  const id = uuid()
  const threadId = req.body.threadId || uuid()
  await addComment({
    id, text, user, threadId, blob,
  })
  res.send('OK')
}))

// @api GET /api/comments/:threadId
// Get comments by threadId
//
// returns JSON array of all comments in thread
router.get('/comments/:threadId', catchErrors(async (req, res) => {
  const { threadId } = req.params
  await getThreadComments(threadId).then((rows) => {
    res.send(rows)
  })
}))

// @api GET /api/questions
// Retrieve all questions.
//
// returns JSON array of all questions in database
router.get('/questions', catchErrors(async (req, res) => {
  await getQuestions().then((rows) => {
    res.send(rows)
  })
}))

// @api POST /api/questions
// adds question to database.
//
// @params @json {
//   "text": "What?",
//   "user": "salaattipoika",
//   "blob": "{\"path\": \"/path/to/element\"}"
// }
//
// @returns 'OK' if question is succesfully added
router.post('/questions', catchErrors(async (req, res) => {
  const { text, user, blob } = req.body
  const id = uuid()
  const threadId = req.body.threadId || uuid()
  await addQuestion({
    id, text, user, threadId, blob,
  })
  res.send('OK')
}))

// @api GET /api/reactions
// Retrieve all reactions.
//
// returns JSON array of all reactions in database
router.get('/reactions', catchErrors(async (req, res) => {
  await getReactions().then((rows) => {
    res.send(rows)
  })
}))

// @api GET /api/reactions/:commentId
// Retrieve all reactions by commentId.
//
// returns JSON array of all reactions to comment
router.get('/reactions/:commentId', catchErrors(async (req, res) => {
  const { commentId } = req.params
  await getCommentReactions(commentId).then((rows) => {
    res.send(rows)
  })
}))

// @api POST /api/reactions
// add reaction to the database.
//
// @params @json {
//   "emoji": "🍑",
//   "user": "jaba",
//   "comment_id": "1bd8052b"
// }
//
// @returns 'OK' if reaction is succesfully added
router.post('/reactions', catchErrors(async (req, res) => {
  const { emoji, user, commentId } = req.body
  const id = uuid()
  await addReaction({
    id, emoji, user, commentId,
  })
  res.send('OK')
}))

module.exports = router
