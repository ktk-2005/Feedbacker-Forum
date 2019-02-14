import assert from 'assert'
import apiRequest from './api-request'

describe('/api/comments', () => {
  it('should return OK for posting a commment', async () => {
    const response = await apiRequest('POST', '/api/comments', {
      text: 'testing',
      blob: { path: '/path/to/element' },
    })
    assert.equal(typeof response.id, 'string')
  })
})

describe('/api/comments', () => {
  it('should handle multiple posts', async () => {
    const body = { text: 'Test' }
    await apiRequest('POST', '/api/comments', body)
    await apiRequest('POST', '/api/comments', body)
    await apiRequest('POST', '/api/comments', body)
  })

  it('should work with newly created user', async () => {
    const { id: userId, secret } = await apiRequest('POST', '/api/users')
    const response = await apiRequest('POST', '/api/comments',
      { text: 'First' }, {
        users: { [userId]: secret },
      })

    assert.equal(typeof response.id, 'string')
  })

  it('should support threading', async () => {
    const { threadId } = await apiRequest('POST', '/api/comments', { text: 'First' })
    const response = await apiRequest('POST', '/api/comments', { threadId, text: 'Second' })
    assert.equal(typeof response.id, 'string')
  })

  it('every comment text should be string', async () => {
    const response = await apiRequest('POST', '/api/comments', {
      text: 'This is a comment',
      blob: { path: '/path/to/element' },
    })
    assert.equal(typeof response.id, 'string')
  })
})

describe('/api/questions', () => {
  it('should handle multiple posts', async () => {
    const body = { text: 'Test', type: 'text' }
    await apiRequest('POST', '/api/questions', body)
    await apiRequest('POST', '/api/questions', body)
    await apiRequest('POST', '/api/questions', body)
  })

  it('should return OK', async () => {
    const response = await apiRequest('POST', '/api/questions', {
      text: 'Pääpäivä?',
      type: 'text',
    })
    assert.equal(typeof response.id, 'string')
  })
})

describe('/api/questions', () => {
  it('should return the last question', async () => {
    const questions = await apiRequest('GET', '/api/questions')
    assert.equal(questions[questions.length - 1].text, 'Pääpäivä?')
  })
})


describe('/api/reactions', () => {
  it('should handle multiple posts', async () => {
    const { id: commentId } = await apiRequest('POST', '/api/comments', { text: 'Test' })

    await apiRequest('POST', '/api/reactions', { commentId, emoji: 'up' })
    await apiRequest('POST', '/api/reactions', { commentId, emoji: 'down' })
    await apiRequest('POST', '/api/reactions', { commentId, emoji: 'fire' })
  })

  it('should return OK', async () => {
    const { id: commentId } = await apiRequest('POST', '/api/comments', { text: 'Test' })

    const response = await apiRequest('POST', '/api/reactions', { commentId, emoji: 'up' })
    assert.equal(typeof response.id, 'string')
  })
})
