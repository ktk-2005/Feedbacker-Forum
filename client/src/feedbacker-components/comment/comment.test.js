import React from 'react'
import { mount } from 'enzyme'
import configureMockStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import Comment from './comment'

let mockStore
let testProps
let middlewares

const id = 123456
const devComment = {
  text: 'This doesn\'t work',
  time: '2019-02-02T18:00:00+02:00',
  reactions: 'down',
  blob: { dev: true },
}

const role = 'dev'

beforeEach(() => {
  middlewares = []
  mockStore = configureMockStore(middlewares)
  testProps = {
    id,
    comment: devComment,
    role,
  }
})

test('Comment should mount with correct text', () => {
  const store = mockStore()
  const comment = mount(
    <Provider store={store}>
      <Comment {...testProps} />
    </Provider>
  )
  const wrapper = comment.find('.text')
  expect(wrapper.text()).toBe(devComment.text)
})
