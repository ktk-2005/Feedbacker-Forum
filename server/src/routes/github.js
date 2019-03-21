import express from 'express'
import * as R from 'ramda'
import { catchErrors } from '../handlers'
import { reqUser } from './helpers'
import { getOAuthRedirectUrl, oAuthCallback, getLoginStatus, getInstallationsWithAccess, getReposOfInstallation } from '../githubapp'

const router = express.Router()

// @api GET /api/github/oauth2login
// Returns an url for the Oauth2 redirect.
router.get('/oauth2login', catchErrors(async (req, res) => {
  const { userId } = await reqUser(req)

  const url = await getOAuthRedirectUrl(userId)

  res.json({ url })
}))

// @api GET /api/github/oauth2callback
// GitHub redirects the user to this url after performing authentication.
router.get('/oauth2callback', catchErrors(async (req, res) => {
  const { users } = JSON.parse(req.cookies.FeedbackerForum_persist)
  // NOTE: USER NOT VERIFIED
  await oAuthCallback(req.originalUrl, R.keys(users)[0])

  res.redirect('/create')
}))

// @api GET /api/github/status
// Retrieves the registered GitHub login state of the user.
router.get('/status', catchErrors(async (req, res) => {
  const { userId } = await reqUser(req)
  res.json({
    status: await getLoginStatus(userId),
    installations: await getInstallationsWithAccess(userId),
  })
}))

// @api GET /api/github/repos/:installationId
// Retrieves user-accessable repositories by installation id. A list of
// available ids is container in the /api/github/status response.
router.get('/repos/:installationId', catchErrors(async (req, res) => {
  const { userId } = await reqUser(req)
  const { installationId } = req.params
  res.json({
    repos: await getReposOfInstallation(installationId, userId),
  })
}))


module.exports = router
