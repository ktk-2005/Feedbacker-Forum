import express from 'express'
import request from 'request'
import { uuid, reqUser } from './helpers'
import { catchErrors } from '../handlers'
import {
  addSlackUser,
  linkSlackToUser,
  setSlackUser,
  getSlackUser,
  confirmContainerOwnership
} from '../database'

const router = express.Router()

// TODO: Define these, gotten from Slack api, move to env
// CHANGE THESE FOR BETA KTK SLACK
// REAL const clientId = '13555351540.557284460738' // process.env.client_id
// REAL const clientSecret = 'fbc944900f51bb22b960676a1ccd53fa' // process.env.client_secret
// Use this to make sure requests come from Slack, DEPRECATED???
// REAL const verificationToken = 'xcPW8ST04fDX1YHdY2ym08Qc' // process.env.token

const clientId = '563857873046.569019332453'
const clientSecret = 'ad1592debf2b5dd6ab7dd762e2953826'

// FIX Return doc (line 19)

// @api GET /api/slack/oauth
// Authentication with Slack sign in.
// This path should only be called by Slack oauth after pressing 'Sign in with Slack'-button.
//
// Returns error if authentication failed or redirects back to dashboard otherwise?
router.get('/oauth', catchErrors(async (req, res) => {
  // Make updates to database with state(=slack_users.id)
  const { state } = req.query
  const options = {
    uri: `https://slack.com/api/oauth.access?code=${req.query.code}&client_id=${clientId}+'&client_secret=${clientSecret}`,
    method: 'GET',
  }
  await request(options, async (error, response, body) => {
    const parsedBody = JSON.parse(body)
    if (!parsedBody.ok) {
      console.log(parsedBody)
      res.send(`Error encountered: \n${JSON.stringify(parsedBody)}`)
        .status(200)
        .end()
    } else {
      // DO SOMETHING WITH USER INFO (UPDATE SLACK_USERS TABLE)
      console.log(parsedBody)
      await setSlackUser(state, parsedBody.user.name, parsedBody.user.id)
      // FIX THIS, to redirect to dashboard?
      res.redirect('/')
    }
  })
}))

// @api GET /api/slack/oauth/connect
// For letting our slack authentication know who user clicked 'Sign in with Slack'-button
//
// Returns redirect to Slack's oauth.
router.post('/oauth/connect', catchErrors(async (req, res) => {
  const { users } = await reqUser(req)
  const id = uuid(8)
  await addSlackUser(id)
  for (const userId of Object.keys(users)) {
    await linkSlackToUser(id, userId)
  }
  const slackURL = `https://slack.com/oauth/authorize?scope=identity.basic&client_id=${clientId}`
  res.json({ url: `${slackURL}&state=${id}` })
}))

// @api GET /api/slack/auth
// For checking if user has connected to Slack
//
// Returns json containing boolean indicating whether connected or not.
// Contains slack username and user id if connected as well.
router.get('/auth', catchErrors(async (req, res) => {
  const { users } = await reqUser(req)
  for (const userId of Object.keys(users)) {
    const slackUser = await getSlackUser(userId)
    if (slackUser.length > 0 && slackUser[0].slack_user_id) {
      console.log(slackUser[0])
      res.json({ slackAuth: true, slackUser: slackUser[0] })
      return
    }
  }
  res.json({ slackAuth: false })
}))

// @api GET /api/slack/command/help
// Slack slash help command, should only be called from Slack.
//
// Returns text explanation of how this Slack bot works.
router.get('/command/help', catchErrors((req, res) => {
  // TODO: What should help command return?
  const help = 'Help command'
  res.send(help)
}))

router.get('/notify/:container/:domain', catchErrors(async (req, res) => {
  const { container, domain } = req.params
  const { users } = await reqUser(req)
  // Check if user owns this container
  try {
    await confirmContainerOwnership(container, users)
  } catch (error) {
    res.json({ success: false, error })
    return
  }
  // Change this webhook URL to match used slack app
  const webhookURL = 'https://hooks.slack.com/services/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'

  // Remove
  console.log(`//${container}.${domain}`)
  request({
    url: webhookURL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // TODO: Right notification message
      text: `Check this new feedbacker instance out: http://${container}.${domain}`,
    }),
  })

  res.json({ success: true })
}))

module.exports = router
