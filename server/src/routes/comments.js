/* eslint-disable camelcase */
import express from 'express'
import {
  getComments, getQuestions, getReactions, getThreadComments,
  getCommentReactions, addReaction, addQuestion, addComment
} from '../database'
import { uuid } from './helpers'
import { catchErrors } from '../handlers'

const router = express.Router()

router.get('/comments', catchErrors(async (req, res) => {
  await getComments().then((rows) => {
    res.send(rows)
  })
}))

router.post('/comment', catchErrors(async (req, res) => {
  const { text, user, blob } = req.body
  const id = uuid()
  const threadId = req.body.threadId || uuid()
  await addComment([id, text, user, threadId, blob])
  res.send('OK')
}))

router.get('/comments/:threadId', catchErrors(async (req, res) => {
  const { threadId } = req.params
  await getThreadComments(threadId).then((rows) => {
    res.send(rows)
  })
}))

router.get('/questions', catchErrors(async (req, res) => {
  await getQuestions().then((rows) => {
    res.send(rows)
  })
}))

router.post('/question', catchErrors(async (req, res) => {
  const { text, user, blob } = req.body
  const id = uuid()
  const threadId = req.body.threadId || uuid()
  await addQuestion([id, text, user, threadId, blob])
  res.send('OK')
}))

router.get('/reactions', catchErrors(async (req, res) => {
  await getReactions().then((rows) => {
    res.send(rows)
  })
}))

router.get('/reactions/:commentId', catchErrors(async (req, res) => {
  const { commentId } = req.params
  await getCommentReactions(commentId).then((rows) => {
    res.send(rows)
  })
}))

router.post('/reaction', catchErrors(async (req, res) => {
  const { emoji, user, commentId } = req.body
  const id = uuid()
  await addReaction([id, emoji, user, commentId])
  res.send('OK')
}))

module.exports = router
