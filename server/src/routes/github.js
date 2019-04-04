import express from 'express'
import { catchErrors } from '../handlers'
import { reqUser } from './helpers'
import { getOAuthRedirectUrl, oAuthCallback, getLoginStatus, getInstallationsWithAccess, getReposOfInstallation } from '../githubapp'
import { deleteAccessTokenForUserId } from '../database'

const router = express.Router()

// @api GET /api/github/oauth2login
// Returns an url for the Oauth2 redirect.
router.get('/oauth2login', catchErrors(async (req, res) => {
  const { users } = await reqUser(req)

  const url = await getOAuthRedirectUrl(Object.keys(users))

  res.json({ url })
}))

// @api GET /api/github/oauth2callback
// GitHub redirects the user to this url after performing authentication.
router.get('/oauth2callback', catchErrors(async (req, res) => {
  const { users } = await reqUser(req)
  await oAuthCallback(req.originalUrl, Object.keys(users))

  res.redirect('/create/github')
}))

// @api GET /api/github/status
// Retrieves the registered GitHub login state of the user.
router.get('/status', catchErrors(async (req, res) => {
  const { users } = await reqUser(req)
  const status = await getLoginStatus(Object.keys(users))
  if (status) {
    const installations = await getInstallationsWithAccess(Object.keys(users))
    res.json({
      status,
      installations,
    })
  } else {
    res.json({ status })
  }
}))

// @api POST /api/github/logout
// Removes the stored access token for github
router.post('/logout', catchErrors(async (req, res) => {
  const { users } = await reqUser(req)
  for (const userId of Object.keys(users)) {
    await deleteAccessTokenForUserId(userId)
  }
  res.json({})
}))

// @api GET /api/github/repos/:installationId
// Retrieves user-accessable repositories by installation id. A list of
// available ids is container in the /api/github/status response.
router.get('/repos/:installationId', catchErrors(async (req, res) => {
  const { users } = await reqUser(req)
  const { installationId } = req.params
  res.json({
    repos: await getReposOfInstallation(installationId, Object.keys(users)),
  })
}))


module.exports = router
