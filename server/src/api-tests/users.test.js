import assert from 'assert'
import apiRequest from './api-request'

describe('/api/users', () => {
  it('should handle multiple posts', async () => {
    await apiRequest('/api/users', { method: 'POST' })
    await apiRequest('/api/users', { method: 'POST' })
    await apiRequest('/api/users', { method: 'POST' })
  })

  it('should return key and secret as strings', async () => {
    const response = await apiRequest('/api/users', {
      method: 'POST',
    })
    assert.equal(typeof response.id, 'string')
    assert.equal(typeof response.secret, 'string')
  })
})
