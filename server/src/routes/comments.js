/* eslint-disable camelcase */
import express from 'express'
import {
  getComments, getQuestions, getReactions, getThreadComments,
  getCommentReactions, addReaction, addQuestion, addComment
} from '../database'
import { uuid } from './helpers'

const router = express.Router()

router.get('/comments', (req, res) => {
  getComments().then((rows) => {
    res.send(rows)
  }, (err) => {
    console.error(err)
  })
})

router.get('/comments/:threadId', (req, res) => {
  const { threadId } = req.params
  getThreadComments(threadId).then((rows) => {
    res.send(rows)
  }, (err) => {
    console.error(err)
  })
})

router.get('/questions', (req, res) => {
  getQuestions().then((rows) => {
    res.send(rows)
  }, (err) => {
    console.error(err)
  })
})

router.get('/reactions', (req, res) => {
  getReactions().then((rows) => {
    res.send(rows)
  }, (err) => {
    console.error(err)
  })
})

router.get('/reactions/:commentId', (req, res) => {
  const { commentId } = req.params
  getCommentReactions(commentId).then((rows) => {
    res.send(rows)
  }, (err) => {
    console.error(err)
  })
})

router.post('/reaction', (req, res) => {
  const { emoji, user, commentId } = req.body
  const id = uuid()
  addReaction([id, emoji, user, commentId]).catch((err) => {
    console.error(err)
  })
  res.send('👌')
})

router.post('/question', (req, res) => {
  const { text, user, blob } = req.body
  const id = uuid()
  const threadId = req.body.threadId || uuid()
  addQuestion([id, text, user, threadId, blob]).catch((err) => {
    console.error(err)
  })
  res.send('👌')
})

router.post('/comment', (req, res) => {
  const { text, user, blob } = req.body
  const id = uuid()
  const threadId = req.body.threadId || uuid()
  addComment([id, text, user, threadId, blob]).catch((err) => {
    console.error(err)
  })
  res.send('👌')
})

module.exports = router
