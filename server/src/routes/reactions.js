/* eslint-disable camelcase */
import express from 'express'
import {
  getReactions, getCommentReactions, addReaction, deleteReaction
} from '../database'
import { uuid, attempt } from './helpers'
import { catchErrors } from '../handlers'

const router = express.Router()

// @api GET /api/reactions
// Retrieve all reactions.
//
// returns JSON array of all reactions in database
router.get('/', catchErrors(async (req, res) => {
  const reactions = await getReactions()
  res.send(reactions.map(r => ({
    commentId: r.comment_id,
    userID: r.user_id,
    emoji: r.reaction_emoji,
    time: r.time,
    id: r.id,
  })))
}))

// @api GET /api/reactions/:commentId
// Retrieve all reactions by commentId.
//
// returns JSON array of all reactions to comment
router.get('/:commentId', catchErrors(async (req, res) => {
  const { commentId } = req.params
  const reaction = await getCommentReactions(commentId)
  res.send(reaction.map(r => ({
    commentId: r.comment_id,
    userID: r.user_id,
    emoji: r.reaction_emoji,
    time: r.time,
    id: r.id,
  })))
}))

// @api POST /api/reactions
// add reaction to the database.
//
// Example body @json {
//   "emoji": "fire",
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

//

// @api DELETE /api/reactions/:commentId
// Remove reaction from the database.
//
// Returns JSON indicating whether deletion was successful or not
router.delete('/', catchErrors(async (req, res) => {
  const { emoji, userId, commentId } = req.body
  const resu = await deleteReaction({ commentId, emoji, userId })
  console.log(resu)
  res.json(resu)
}))

module.exports = router
