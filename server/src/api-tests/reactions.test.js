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
        commentId: '13adr8sa',
      },
    })
    assert.equal(typeof response.id, 'string')
  })
})

describe('/api/reactions', () => {
  it('should return OK for deleting a reaction', async () => {
    await apiRequest('/api/reactions', {
      method: 'DELETE',
      body: {
        userId: 'da776df3',
        secret: 'sf8a7s',
        emoji: 'fire',
        commentId: '13adr8sa',
      },
    })
    const response = await apiRequest('/api/comments')
    assert.equal(response['13adr8sa'].reactions.find(r => r.userId === 'da776df3' && r.emoji === 'fire'), undefined)
  })
})