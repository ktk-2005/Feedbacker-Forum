import express from 'express'
import request from 'request'
import { uuid, reqUser } from './helpers'
import { catchErrors } from '../handlers'
import { addSlackUser, linkUserToSlack } from '../database'

const router = express.Router()

// TODO: Define these, gotten from Slack api, move to env
const clientId = '13555351540.557284460738' // process.env.client_id
const clientSecret = 'fbc944900f51bb22b960676a1ccd53fa' // process.env.client_secret
// Use this to make sure requests come from Slack, DEPRECATED???
const verificationToken = 'xcPW8ST04fDX1YHdY2ym08Qc' // process.env.token

// FIX Return doc (line 19)

// @api GET /api/slack/oauth
// Authentication with Slack sign in.
// This path should only be called by Slack oauth after pressing 'Sign in with Slack'-button.
//
// Returns error if authentication failed or redirects back to dashboard otherwise?
router.get('/oauth', catchErrors(async (req, res) => {
  const options = {
    uri: `https://slack.com/api/oauth.access?code=${req.query.code}&client_id=${clientId}+'&client_secret=${clientSecret}`,
    method: 'GET',
  }
  await request(options, (error, response, body) => {
    const parsedBody = JSON.parse(body)
    if (!parsedBody.ok) {
      console.log(parsedBody)
      res.send(`Error encountered: \n${JSON.stringify(parsedBody)}`)
        .status(200)
        .end()
    } else {
      // DO SOMETHING WITH USER INFO
      console.log(parsedBody)
      // FIX THIS, to redirect to dashboard?
      res.send('Success')
    }
  })
}))

// @api GET /api/slack/oauth/connect
// For letting our slack authentication know who user clicked 'Sign in with Slack'-button
//
// Returns redirect to Slack's oauth.
router.get('/oauth/connect', catchErrors(async (req, res) => {
  const { users } = await reqUser(req)
  const id = uuid(8)
  await addSlackUser(id)
  for (const userId of Object.keys(users)) {
    await linkUserToSlack(id, userId)
  }
  const slackURL = `https://slack.com/oauth/authorize?scope=identity.basic&client_id=${clientId}`
  res.redirect(`${slackURL}&state=${id}`)
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
