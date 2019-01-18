import assert from 'assert'
import apiRequest from './api-request'

describe('/api/users', () => {
  it('should handle multiple posts', async () => {
    await apiRequest('POST', '/api/users')
    await apiRequest('POST', '/api/users')
    await apiRequest('POST', '/api/users')
  })

  it('should return key and secret as strings', async () => {
    const response = await apiRequest('POST', '/api/users')
    assert.equal(typeof response.id, 'string')
    assert.equal(typeof response.secret, 'string')
  })
})
