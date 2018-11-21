import express from 'express'
const router = express.Router()

router.use('/version', require('./version'))
//router.use('/keys', require('./keys'))
router.use('/', require('./comments'))

module.exports = router
