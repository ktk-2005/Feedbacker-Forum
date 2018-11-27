import assert from 'assert'
import apiRequest from './api-request'

describe('/api/users', () => {
  it('should return key and secret as strings', async () => {
    const stuff = await apiRequest('/api/users')
    //
    assert.equal(typeof.stuff.key, 'string')
    assert.equal(typeof.stuff.secret, 'string')
    //
    })
})

describe('/api/users', () => {
  it('should return all comments', async () => {
    const comments = await apiRequest('/api/users',)
    //
    assert.equal(commnts[0].text, 'skrattia')
    //
    assert(version.gitHash.match(/[a-f0-9]*/))
  })
})
