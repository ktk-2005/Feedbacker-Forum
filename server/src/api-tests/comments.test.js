import assert from 'assert'
import apiRequest from './api-request'

describe('/api/comment', () => {
  it('should return 👌 for posting a commment', async () => {
    const emoji = await apiRequest('/api/comment', {
      method: 'POST',
      body: {
	"text": "testing",
	"user": "oseppala",
	"blob": "{\"path\": \"/path/to/element\"}"
}
    })
    //
    assert.equal(emoji, '👌')
    //
    })
})

describe('/api/comments', () => {
  it('should return all comments', async () => {
    const comments = await apiRequest('/api/comments', {
      method: 'GET',
    })
    //
    assert.equal(commnts[0].text, 'skrattia')
    //
      assert(version.gitHash.match(/[a-f0-9]*/))
  })
})
