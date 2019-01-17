import assert from 'assert'
import apiRequest from './api-request'

describe('/api/instances', () => {
  it('should return multiple instances', async () => {
    const response = await apiRequest('GET', '/api/instances')
    assert.strictEqual(response.length > 1, true)
  })
})

describe('/api/instances', () => {
  it('should return needed values', async () => {
    const response = await apiRequest('GET','/api/instances')
    const firstInstance = response[0]
    assert.strictEqual(firstInstance.hasOwnProperty('id'), true)
    assert.strictEqual(firstInstance.hasOwnProperty('subdomain'), true)
  })
})
