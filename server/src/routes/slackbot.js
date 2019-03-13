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
// CHANGE THESE TO MATCH USED SLACK APP

// Doesn't need to be private
const clientId = '563857873046.569019332453'
// Needs to be private
const clientSecret = 'ad1592debf2b5dd6ab7dd762e2953826'
// Bot token can be obtained via Add to Slack -button
const token = 'xoxb-563857873046-570133284070-d05OPITH7fjvxONFhNZVOWOX'
// Doesn't need to be private
const webhookURL = 'https://hooks.slack.com/services/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'

// @api GET /api/slack/oauth
// Authentication with Slack sign in.
// This path should only be called by Slack oauth after pressing 'Sign in with Slack'-button.
//
// Returns error if authentication failed or redirects back to dashboard otherwise
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
      res.send(`Error encountered: \n${JSON.stringify(parsedBody)}`)
        .status(200)
        .end()
    } else {
      // DO SOMETHING WITH USER INFO (UPDATE SLACK_USERS TABLE)
      await setSlackUser(state, parsedBody.user.name, parsedBody.user.id)
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

// @api GET /api/slack/command/status
// Slack slash status command, should only be called from Slack.
//
// Returns status check if user has connected Slack account to Feedbacker forum.
router.get('/command/status', catchErrors((req, res) => {
  // CHecks if connected
  // if not "go to url domain and link ur account"
  // else all set
  console.log(req.body)
  const username = req.body.user_name
  const userId = req.body.user_id
  const status = `Status check for ${username}, id: ${userId}`
  res.send(status)
}))

// @api GET /api/slack/notify/:container/:domain
// Used for sending slack notifications by webhook when wanting to share published instance.
//
// Returns json object with 'success' boolean field indicating whether notification was send or not.
router.get('/notify/:url', catchErrors(async (req, res) => {
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
      // TODO: Right notification message
      text: `Check this new feedbacker instance out: http://${url}`,
    }),
  })

  // For private messages
  request({
    url: `https://slack.com/api/im.open?token=${token}&user=UGKEJFTEK`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }, (error, response, body) => {
    const JSONres = JSON.parse(body)
    if (JSONres.ok) {
      const channel = JSONres.channel.id
      const message = 'Sup dude, you got a new comment'
      request({
        url: `https://slack.com/api/chat.postMessage?token=${token}&channel=${channel}&text=${message}&pretty=1`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } else {
      console.log('Failed')
    }
  })
  //

  res.json({ success: true })
}))

module.exports = router
