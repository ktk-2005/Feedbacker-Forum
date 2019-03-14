import React from 'react'
import { mount } from 'enzyme'
import { BrowserRouter as Router } from 'react-router-dom'
import View404 from './404-view'

test('should have back to dashboard text on button', () => {
  const view = mount(
    <Router>
      <View404 />
    </Router>
  )
  const wrapper = view.find('.dashboard-button')
  expect(wrapper.text()).toBe('Back to dashboard')
})
