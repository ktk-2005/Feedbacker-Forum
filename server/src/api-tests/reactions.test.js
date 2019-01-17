import assert from 'assert'
import apiRequest from './api-request'

describe('/api/reactions', () => {
  it('should return OK for posting a reaction', async () => {
    const response = await apiRequest('POST', '/api/reactions', {
      emoji: 'fire',
      commentId: '13adr8sa',
    })
    assert.equal(typeof response.id, 'string')
  })
})

describe('api/reactions', () => {
  it('should not be able to post two of the same reactions', async () => {
    const response = await apiRequest('POST', '/api/reactions', {
      emoji: 'fire',
      commentId: '13adr8sa',
    }, { fail: true })
    assert.equal(response, 'Failed')
  })
})

describe('/api/reactions', () => {
  it('should return OK for deleting a reaction', async () => {
    await apiRequest('DELETE', '/api/reactions', {
      emoji: 'fire',
      commentId: '13adr8sa',
    })
    const response = await apiRequest('GET', '/api/comments')
    assert.equal(response['13adr8sa'].reactions.find(r => r.userId === 'da776df3' && r.emoji === 'fire'), undefined)
  })
})
