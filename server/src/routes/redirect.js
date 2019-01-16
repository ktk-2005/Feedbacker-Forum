import express from 'express'

import { catchErrors } from '../handlers'

const router = express.Router()

// @api GET /site/
// Redirects url used by react router
//
// Redirects from urls used by react router to prevent accidental 404 errors
// from refreshing page when react router has changed url
//
router.get('/*', catchErrors((req, res) => {
  res.redirect('/site.html')
}))

module.exports = router
