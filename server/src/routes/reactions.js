/* eslint-disable camelcase */
import express from 'express'
import { getReactions, getCommentReactions, addReaction } from '../database'
import { uuid, attempt } from './helpers'
import { catchErrors } from '../handlers'

const router = express.Router()

// @api GET /api/reactions
// Retrieve all reactions.
//
// returns JSON array of all reactions in database
router.get('/', catchErrors(async (req, res) => {
  res.send(await getReactions())
}))

// @api GET /api/reactions/:commentId
// Retrieve all reactions by commentId.
//
// returns JSON array of all reactions to comment
router.get('/:commentId', catchErrors(async (req, res) => {
  const { commentId } = req.params
  res.send(await getCommentReactions(commentId))
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
// Returns `{ id }` of the reaction
router.post('/', catchErrors(async (req, res) => {
  const { emoji, userId, commentId } = req.body

  await attempt(async () => {
    const id = uuid()
    await addReaction({
      id, emoji, userId, commentId,
    })
    res.json({ id })
  })
}))

module.exports = router
