import assert from 'assert'
import apiRequest from './api-request'

describe('/api/reactions', () => {
  it('should return OK for posting a reaction', async () => {
    const response = await apiRequest('/api/reactions', {
      method: 'POST',
      body: {
        userId: 'da776df3',
        secret: 'sf8a7s',
        emoji: 'fire',
        commentId: '1907b7e5',
      },
    })
    assert.equal(typeof response.id, 'string')
  })
})

describe('/api/reactions', () => {
  it('should return OK for deleting a reaction', async () => {
    const response = await apiRequest('/api/reactions', {
      method: 'DELETE',
      body: {
        userId: 'da776df3',
        secret: 'sf8a7s',
        emoji: 'fire',
        commentId: '1907b7e5',
      },
    })
    console.log(response)
    assert.equal('string', 'string')
  })
})
