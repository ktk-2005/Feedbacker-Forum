/* eslint-disable camelcase */
import express from 'express'
import {
  getComments, getThreadComments, addComment, addThread
} from '../database'
import { uuid, attempt } from './helpers'
import { catchErrors } from '../handlers'

const router = express.Router()

// @api GET /api/comments
// Retrieve all comments.
//
// returns JSON array of all comments grouped with reactions in database
router.get('/', catchErrors(async (req, res) => {
  const groupedComments = {}
  const comments = await getComments()
  for (const comment of comments) {
    let result = groupedComments[comment.comment_id]
    if (!result) {
      //result = {id: comment.comment_id, user_id: comment.comment_user, reactions: []}
      result = {
        id: comment.comment_id,
        time: comment.comment_time,
        text: comment.comment_text,
        user_id: comment.comment_user_id,
        thread_id: comment.thread_id,
        blob: comment.blob,
        reactions: []}
      groupedComments[comment.comment_id] = result
    }
    if (comment.reaction_id !== null) {
      //let reaction = {id: comment.reaction_id, user_id: comment.reaction_user, emoji: comment.emoji}
      let reaction = {
        id: comment.reaction_id,
        time: comment.reaction_time,
        user_id: comment.reaction_user_id,
        emoji: comment.reaction_emoji,
        comment_id: comment.comment_id, }
      result.reactions.push(reaction)
    }
  }
  res.send(groupedComments)
}))

// @api POST /api/comments
// Adds comment to database.
//
// Example body for a root comment @json {
//   "text": "minttua",
//   "user": "salaattipoika",
//   "container": "abcdef",
//   "blob": "{\"path\": \"/path/to/element\"}"
// }
// comments can be linked to a thread with @json {
//   "text": "minttua",
//   "user": "salaattipoika",
//   "threadId": "1234",
//   "blob": "{\"path\": \"/path/to/element\"}"
// }
//
// Returns `{ id, threadId }` of the new comment
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
    await addComment({
      id, text, userId, threadId, blob,
    })
    res.json({ id, threadId })
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
