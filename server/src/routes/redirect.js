import express from 'express'

import { catchErrors } from '../handlers'

const router = express.Router()

router.get('/*', catchErrors((req, res) => {
  res.redirect('/site.html')
}))

module.exports = router
