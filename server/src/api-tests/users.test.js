import assert from 'assert'
import apiRequest from './api-request'

describe('/api/users', () => {
  it('should return key and secret as strings', async () => {
    const stuff = await apiRequest('/api/users', {
      method: 'POST',
      body: {
        key: '65e086ce',
        secret: '8a38d7dd343843fcbf4d136063ea6d',
      },
    })
    assert.equal(typeof stuff.key, 'string')
    assert.equal(typeof stuff.secret, 'string')
  })
})

describe('/api/users', () => {
  it('should return the name of first user', async () => {
    const users = await apiRequest('/api/users', {
      method: 'GET',
    })
    assert.equal(users[0].name, 'salaattipoika')
  })
})
