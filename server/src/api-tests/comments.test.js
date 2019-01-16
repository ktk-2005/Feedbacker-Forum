import assert from 'assert'
import apiRequest from './api-request'

describe('/api/comments', () => {
  it('should return OK for posting a commment', async () => {
    const response = await apiRequest('/api/comments', {
      method: 'POST',
      body: {
        text: 'testing',
        userId: 'da776df3',
        secret: 'sf8a7s',
        blob: '{"path": "/path/to/element"}',
        container: 'APP-1111',
      },
    })
    assert.equal(typeof response.id, 'string')
  })
})

describe('/api/comments', () => {
  it('first comment s text should be skrattia', async () => {
    const comments = await apiRequest('/api/comments')
    console.log('COMMENTTEXT', comments[Object.keys(comments)[0]].text)
    assert.equal(comments[Object.keys(comments)[0]].text, 'skrattia')
  })
})

describe('/api/comments', () => {
  it('should handle multiple posts', async () => {
    const body = { text: 'Test', userId: 'da776df3', secret: 'sf8a7s', container: 'APP-1111' }
    await apiRequest('/api/comments', { method: 'POST', body })
    await apiRequest('/api/comments', { method: 'POST', body })
    await apiRequest('/api/comments', { method: 'POST', body })
  })

  it('should work with newly created user', async () => {
    const { id: userId, secret } = await apiRequest('/api/users', { method: 'POST' })
    const response = await apiRequest('/api/comments', {
      method: 'POST',
      body: { userId, secret, text: 'First', container: 'APP-1111' },
    })

    assert.equal(typeof response.id, 'string')
  })

  it('should support threading', async () => {
    const userId = 'da776df3'
    const secret = 'sf8a7s'
    const { threadId } = await apiRequest('/api/comments', {
      method: 'POST',
      body: { userId, secret, text: 'First', container: 'APP-1111' },
    })

    const response = await apiRequest('/api/comments', {
      method: 'POST',
      body: { userId, secret, threadId, text: 'Second' },
    })
    assert.equal(typeof response.id, 'string')
  })

  it('every comment text should be string', async () => {
    const response = await apiRequest('/api/comments', {
      method: 'POST',
      body: {
        text: 'This is a comment',
        userId: 'da776df3',
        secret: 'sf8a7s',
        blob: '{"path": "/path/to/element"}',
        container: 'APP-1111',
      },
    })
    assert.equal(typeof response.id, 'string')
  })
})

describe('/api/questions', () => {
  it('should handle multiple posts', async () => {
    const body = { text: 'Test', userId: 'da776df3', secret: 'sf8a7s', container: 'APP-1111' }
    await apiRequest('/api/questions', { method: 'POST', body })
    await apiRequest('/api/questions', { method: 'POST', body })
    await apiRequest('/api/questions', { method: 'POST', body })
  })

  it('should return OK', async () => {
    const response = await apiRequest('/api/questions', {
      method: 'POST',
      body: {
        text: 'Pääpäivä?',
        userId: 'da776df3',
        secret: 'sf8a7s',
        blob: '{"path": "/path/to/element"}',
        threadId: 'THR-1234',
      },
    })
    assert.equal(typeof response.id, 'string')
  })
})

describe('/api/questions', () => {
  it('should return the last question', async () => {
    const questions = await apiRequest('/api/questions')
    assert.equal(questions[questions.length - 1].text, 'Pääpäivä?')
  })
})


describe('/api/reactions', () => {
  it('should handle multiple posts', async () => {
    const { id: commentId } = await apiRequest('/api/comments', { method: 'POST',
      body: { text: 'Test', userId: 'da776df3', secret: 'sf8a7s', container: 'APP-1111' } })

    const body = { userId: 'da776df3', secret: 'sf8a7s', commentId }
    await apiRequest('/api/reactions', { method: 'POST', body: { ...body, emoji: 'up' }  })
    await apiRequest('/api/reactions', { method: 'POST', body: { ...body, emoji: 'down' } })
    await apiRequest('/api/reactions', { method: 'POST', body: { ...body, emoji: 'fire' } })
  })

  it('should return OK', async () => {
    const { id: commentId } = await apiRequest('/api/comments', { method: 'POST',
      body: { text: 'Test', userId: 'da776df3', secret: 'sf8a7s', container: 'APP-1111' } })

    const response = await apiRequest('/api/reactions', {
      method: 'POST',
      body: {
        emoji: '🍑',
        userId: 'da776df3',
        secret: 'sf8a7s',
        commentId,
      },
    })
    assert.equal(typeof response.id, 'string')
  })
})
