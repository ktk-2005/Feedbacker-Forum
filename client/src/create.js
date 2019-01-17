import React from 'react'
import classNames from 'classnames/bind'
import styles from './scss/views/create.scss'
import { Route, Link } from 'react-router-dom'
import Build from './build-view'

const css = classNames.bind(styles)

const huutis = () => {
  console.log('BANANA SLAMA!')
  fetch('/api/instances/new', {
    body: JSON.stringify({
      url: document.getElementById('url').value,
      version: document.getElementById('version').value,
      type: 'node',
      port: document.getElementById('port').value,
      name: document.getElementById('name').value,
      userId: 'da776df3',
    }),
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(res => res.json())
    .then(response => console.log(response))
}


const Create = () => (
  <div className={css('create-view')}>
    <h2>Create an instance</h2>
    <form
<<<<<<< HEAD
      action="/site/build"
      method="post"
=======
>>>>>>> b6373736f7cba60094151f5a9dd89b127a70f0bc
      className={css('form-create')}
      onSubmit={huutis}
      id="form"
    >
      Type
      <select name="type">
        <option id="type" value="node"> Node </option>
      </select>
      Git URL
      <input id="url" type="text" name="url" value="https://github.com/bqqbarbhg/docker-test-server.git" />
      Git Hash
      <input id="version" type="text" name="version" value="master" />
      Name
      <input id="name" type="text" name="name" value="name" />
      Port
      <input id="port" type="number" min="1" max="65535" name="port" value="4000" />
      <input type="submit" value="Create" />
    </form>
  </div>
)

export default Create
