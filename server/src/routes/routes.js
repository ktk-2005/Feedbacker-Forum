import express from 'express'
import cors from '../cors'

const router = express.Router()

router.use('/version', cors(), require('./version'))
router.use('/users', cors(), require('./users'))
router.use('/comments', cors(), require('./comments'))
router.use('/questions', cors(), require('./questions'))
router.use('/reactions', cors(), require('./reactions'))
router.use('/instances', require('./instances'))
router.use('/answers', cors(), require('./answers'))
router.use('/instanceRunners', require('./instanceRunners'))
router.use('/slack', cors(), require('./slackbot'))
router.use('/github', require('./github'))
router.use('/authorization', cors(), require('./authorization'))

module.exports = router
