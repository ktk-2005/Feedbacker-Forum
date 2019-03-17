import React from 'react'
import { mount } from 'enzyme'
import { BrowserRouter as Router } from 'react-router-dom'
import Dashboard from './dashboard-view'

test('Dashboard should mount with \'Sign in with Slack\'-button when not authenticated with Slack', () => {
  const dashboard = mount(
    <Router>
      <Dashboard />
    </Router>
  )
  const slack = dashboard.find('.slack-sign-button')
  expect(slack.length).toBe(1)
})

test('Dashboard shouldn\'t mount with \'Sign in with Slack\'-button when authenticated with Slack', () => {
  const router = mount(
    <Router>
      <Dashboard />
    </Router>
  )
  let dashboard = router.find(Dashboard)
  dashboard.setState({ slackAuth: true })
  dashboard = dashboard.update()
  expect(dashboard.find('.slack-sign-button').length).toBe(0)
})
