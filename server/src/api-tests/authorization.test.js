import apiRequest from './api-request'

describe('/api/authorization', () => {
  it('should return 401 for wrong password/subdomain combination', async () => {
    try {
      await apiRequest('POST', '/api/authorization', {
        password: 'wrong',
        subdomain: 'authorized',
      }, { fail: true })
      return false
    } catch (error) {
      return true
    }
  })

  it('should return 200 for correct password/subdomain combination', async () => {
    // Post with different users every test to avoid duplicates in database
    const { id, secret } = await apiRequest('POST', '/api/users')

    await apiRequest('POST', '/api/authorization', {
      password: 'correct',
      subdomain: 'authorized',
    }, { users: { [id]: secret } })
  })
})
