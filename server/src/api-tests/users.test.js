import assert from 'assert'
import apiRequest from './api-request'

describe('/api/users', () => {

  it('should handle multiple posts', async () => {
    await apiRequest('/api/users', { method: 'POST' })
    await apiRequest('/api/users', { method: 'POST' })
    await apiRequest('/api/users', { method: 'POST' })
  })

  it('should return key and secret as strings', async () => {
    const stuff = await apiRequest('/api/users', {
      method: 'POST',
    })
    assert.equal(typeof stuff.id, 'string')
    assert.equal(typeof stuff.secret, 'string')
  })
})
