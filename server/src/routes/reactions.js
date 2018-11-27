/* eslint-disable camelcase */
import express from 'express'
import { getReactions, getCommentReactions, addReaction } from '../database'
import { uuid } from './helpers'
import { catchErrors } from '../handlers'

const router = express.Router()

// @api GET /api/reactions
// Retrieve all reactions.
//
// returns JSON array of all reactions in database
router.get('/', catchErrors(async (req, res) => {
  await getReactions().then((rows) => {
    res.send(rows)
  })
}))

// @api GET /api/reactions/:commentId
// Retrieve all reactions by commentId.
//
// returns JSON array of all reactions to comment
router.get('/:commentId', catchErrors(async (req, res) => {
  const { commentId } = req.params
  await getCommentReactions(commentId).then((rows) => {
    res.send(rows)
  })
}))

// @api POST /api/reactions
// add reaction to the database.
//
// Example body @json {
//   "emoji": "🍑",
//   "user": "jaba",
//   "comment_id": "1bd8052b"
// }
//
// returns 'OK' if reaction is succesfully added
router.post('/', catchErrors(async (req, res) => {
  const { emoji, userId, commentId } = req.body
  const id = uuid()
  await addReaction({
    id, emoji, userId, commentId,
  })
  res.send('OK')
}))

module.exports = router
