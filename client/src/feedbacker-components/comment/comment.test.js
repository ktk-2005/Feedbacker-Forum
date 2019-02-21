import React from 'react'
import { shallow, mount } from 'enzyme'
import configureMockStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import Comment from './comment'

let mockStore
let testProps
let middlewares

const id = 123456
const devComment = {
  content: 'Wow, such a waste of talend :-DD',
  time: '01.01.1990',
  reactions: 'Thonking',
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
/*
describe('', () => {
  it('', () => {
    expect(test).toEqual('success')
  })
})
*/
test('Comment mount', () => {
  const initialState = { comments: [] }
  const store = mockStore()
  const comment = mount(
    <Provider store={store}>
      <Comment {...testProps} />
    </Provider>
  )
  expect(comment).toHaveLength(1)
})
