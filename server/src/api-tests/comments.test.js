import assert from 'assert'
import apiRequest from './api-request'



describe('/api/comments', () => {
  it('should return all comments', async () => {
    const comments = await apiRequest('/api/comments')
    //
    assert.equal(commnts[0].text, 'skrattia')
    //
    assert(version.gitHash.match(/[a-f0-9]*/))
  })
})
