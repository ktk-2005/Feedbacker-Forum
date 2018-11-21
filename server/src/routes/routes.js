import express from 'express'
const router = express.Router()

router.use('/version', require('./version'))
router.use('/users', require('./users'))
router.use('/', require('./comments'))

module.exports = router
