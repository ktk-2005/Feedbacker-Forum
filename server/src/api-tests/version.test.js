import assert from 'assert'
import apiRequest from './api-request'

describe('/api/version', () => {
  it('should return Git revision information', async () => {
    const version = await apiRequest('GET', '/api/version')
    assert.equal(typeof version.gitHash, 'string')
    assert.equal(typeof version.gitBranch, 'string')
    assert(version.gitHash.match(/[a-f0-9]*/))
  })
})
