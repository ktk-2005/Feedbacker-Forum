import express from 'express'
import request from 'request'
import { uuid, reqUser } from './helpers'
import { catchErrors } from '../handlers'
import {
  addSlackUser,
  linkSlackToUser,
  setSlackUser,
  getSlackUser,
  confirmContainerOwnership,
  isLinkedToSlack,
} from '../database'
import { config } from '../globals'

const router = express.Router()

// CHANGE clientId, clientSecret and webhookURL TO MATCH USED SLACK APP IN ../../local.json

// @api GET /api/slack/oauth
// Authentication with Slack sign in.
// This path should only be called by Slack oauth after pressing 'Sign in with Slack'-button.
//
// Returns error if authentication failed or redirects back to dashboard otherwise
router.get('/oauth', catchErrors(async (req, res) => {
  const { clientId, clientSecret } = config.slack || {}
  const { state, error } = req.query
  if (error) {
    res.redirect(`/?slackError=${error}`)
    return
  }
  const options = {
    uri: `https://slack.com/api/oauth.access?code=${req.query.code}&client_id=${clientId}+'&client_secret=${clientSecret}`,
    method: 'GET',
  }
  await request(options, async (error, response, body) => {
    const parsedBody = JSON.parse(body)
    if (!parsedBody.ok) {
      res.redirect(`/?slackError=${parsedBody.error}`)
    } else {
      const { name, id } = parsedBody.user
      await setSlackUser(state, name, id)
      res.redirect('/?slackOk=true')
    }
  })
}))

// @api POST /api/slack/oauth/connect
// For letting our slack authentication know who user clicked 'Sign in with Slack'-button
//
// Returns redirect to Slack's oauth.
router.post('/oauth/connect', catchErrors(async (req, res) => {
  const { clientId } = config.slack || {}
  const { users } = await reqUser(req)
  const { redirectURI } = req.body
  const id = uuid(8)
  await addSlackUser(id)
  for (const userId of Object.keys(users)) {
    await linkSlackToUser(id, userId)
  }
  const slackURL = `https://slack.com/oauth/authorize?scope=identity.basic&client_id=${clientId}`
  res.json({ url: `${slackURL}&state=${id}&redirect_uri=${encodeURIComponent(`${redirectURI}/api/slack/oauth`)}` })
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
      res.json({ slackAuth: true, slackUser: slackUser[0] })
      return
    }
  }
  res.json({ slackAuth: false })
}))

// @api POST /api/slack/command/status
// Slack slash status command, should only be called from Slack.
//
// Returns status check if user has connected Slack account to Feedbacker forum.
router.post('/command/status', catchErrors(async (req, res) => {
  const userId = req.body.user_id
  const slackUser = await isLinkedToSlack(userId)
  if (slackUser.length > 0) {
    res.send('Slack user linked to Feedbacker Forum!')
  } else {
    res.send('You haven\'t yet linked your Slack user to Feedbacker Forum. You can do this by visiting Feedbacker Forum and clicking \'Sign in with Slack\' button!')
  }
}))

// @api GET /api/slack/notify/:url
// Used for sending slack notifications by webhook when wanting to share published instance.
//
// Returns json object with 'success' boolean field indicating whether notification was send or not.
router.get('/notify/:url', catchErrors(async (req, res) => {
  const { webhookURL } = config.slack || {}
  let { url } = req.params
  const { users } = await reqUser(req)
  url = url.split('.').filter(x => x !== 'dev').join('.')
  const container = url.split('.')[0]
  // Check if user owns this container
  try {
    await confirmContainerOwnership(container, users)
  } catch (error) {
    throw new Error('Not authorised')
  }

  request({
    url: webhookURL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: `Check this new feedbacker instance out: https://${url}`,
    }),
  })

  res.json({ success: true })
}))

module.exports = router
