import React from 'react'
import apiCall from '../api-call'


const startOauth = async () => {
  const { url } = await apiCall('POST', '/slack/oauth/connect')
  window.location.replace(url)
}

const slackSignButton = () => (
  <button
    onClick={startOauth}
    type="button"
  >
    <img
      alt="Sign in with Slack"
      height="40"
      width="172"
      src="https://platform.slack-edge.com/img/sign_in_with_slack.png"
      srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x"
    />
  </button>
)

export default slackSignButton
