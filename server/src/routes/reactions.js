/* eslint-disable camelcase */
import express from 'express'
import {
  addReaction, deleteReaction, verifyUser
} from '../database'
import { uuid, attempt } from './helpers'
import { catchErrors } from '../handlers'

const router = express.Router()

// @api POST /api/reactions
// add reaction to the database.
//
// Example body @json {
//   "emoji": "fire",
//   "user": "jaba",
//   "secret": "408c43a509ee4c63",
//   "comment_id": "1bd8052b"
// }
//
// Returns `{ id }` of the reaction
router.post('/', catchErrors(async (req, res) => {
  const {
    emoji, userId, secret, commentId,
  } = req.body
  await verifyUser(userId, secret)

  await attempt(async () => {
    const id = uuid()
    await addReaction({
      id, emoji, userId, commentId,
    })
    res.json({ id })
  })
}))

// @api DELETE /api/reactions
// Remove reaction from the database.
//
// Returns JSON indicating whether deletion was successful or not
router.delete('/', catchErrors(async (req, res) => {
  const {
    emoji, userId, secret, commentId,
  } = req.body
  await verifyUser(userId, secret)
  res.json(await deleteReaction({ commentId, emoji, userId }))
}))

module.exports = router
