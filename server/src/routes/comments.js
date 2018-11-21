/* eslint-disable camelcase */
import express from 'express'
import uuidv4 from 'uuid/v4'
import {
  getComments, getQuestions, getReactions, getTHreadComments,
  getCommentReactions, addReaction, addQuestion, addComment
} from '../database'

const router = express.Router()

// Generate unique random id
function uuid(length = 8) {
  return uuidv4().split('-').join('').slice(0, length)
}

router.get('/comments', (req, res) => {
  getComments().then((rows) => {
    res.send(rows)
  }, (err) => {
    console.error(err)
  })
})

router.get('/comments/:thread_id', (req, res) => {
  const { thread_id } = req.params
  getTHreadComments(thread_id).then((rows) => {
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

router.get('/reactions/:comment_id', (req, res) => {
  const { comment_id } = req.params
  getCommentReactions('reactions', comment_id).then((rows) => {
    res.send(rows)
  }, (err) => {
    console.error(err)
  })
})

router.post('/reaction', (req, res) => {
  const { emoji, user, comment_id } = req.body
  const id = uuid()
  addReaction([id, emoji, user, comment_id]).catch((err) => {
    console.error(err)
  })
  res.send('👌')
})

router.post('/question', (req, res) => {
  const { text, user } = req.body
  const id = uuid()
  const thread_id = req.body.thread_id || uuid()
  addQuestion([id, text, user, thread_id], 'question').catch((err) => {
    console.error(err)
  })
  res.send('👌')
})

router.post('/comment', (req, res) => {
  const { text, user } = req.body
  const id = uuid()
  const thread_id = req.body.thread_id || uuid()
  addComment([id, text, user, thread_id], 'question').catch((err) => {
    console.error(err)
  })
  res.send('👌')
})

module.exports = router
