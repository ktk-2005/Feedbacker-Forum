import React from 'react'

const Create = () => (
  <div>
    <h2>Create an instance my dude</h2>
    <form action="/container" method="post">
      Git URL
      <input type="text" name="name" />
      Git hash
      <input type="text" name="name" />
      Type
      <input type="text" name="name" />
      Name
      <input type="text" name="name" />
      <input type="submit" value="Submit" />
    </form>
  </div>
)

export default Create
