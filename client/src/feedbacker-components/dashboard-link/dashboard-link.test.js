import React from 'react'
import { mount } from 'enzyme'
import configureMockStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import DashboardLink from './dashboard-link'

let mockStore
let middlewares

beforeEach(() => {
  middlewares = []
  mockStore = configureMockStore(middlewares)
})

test('should have back to dashboard text on button', () => {
  const store = mockStore()
  const view = mount(
    <Provider store={store}>
      <DashboardLink />
    </Provider>
  )
  const wrapper = view.find('.dashboard-button')
  expect(wrapper.text()).toBe('Back to dashboard')
})

test('link should be correct', () => {
  global.window = Object.create(window)
  const url = 'https://new-feature-4cdfa.feedbacker.site'
  Object.defineProperty(window, 'location', {
    value: {
      origin: url,
    },
  })
  const store = mockStore()
  const view = mount(
    <Provider store={store}>
      <DashboardLink />
    </Provider>
  )
  const wrapper = view.find('.dashboard-button')
  expect(wrapper.props().href).toBe('//feedbacker.site')
})
