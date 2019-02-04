import express from 'express'

const router = express.Router()

router.use('/version', require('./version'))
router.use('/users', require('./users'))
router.use('/comments', require('./comments'))
router.use('/questions', require('./questions'))
router.use('/reactions', require('./reactions'))
router.use('/instances', require('./instances'))
router.use('/instanceRunners', require('./instanceRunners'))

module.exports = router
