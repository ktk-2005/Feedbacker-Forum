import express from 'express'
import * as R from 'ramda'
import { catchErrors } from '../handlers'
import { reqUser } from './helpers'
import { getOAuthRedirectUrl, oAuthCallback } from '../githubapp'

const router = express.Router()

// @api GET /api/github/oauth2login
// Returns an url for the Oauth2 redirect.
router.get('/oauth2login', catchErrors(async (req, res) => {
  const { userId } = await reqUser(req)

  const url = await getOAuthRedirectUrl(userId)

  res.json({ url })
}))

router.get('/oauth2callback', catchErrors(async (req, res) => {
  const { users } = JSON.parse(req.cookies.FeedbackerForum_persist)
  // NOTE: USER NOT VERIFIED
  await oAuthCallback(req.originalUrl, R.keys(users)[0])

  res.redirect('/')
}))

module.exports = router
