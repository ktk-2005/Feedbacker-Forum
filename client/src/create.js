import React from 'react'
import classNames from 'classnames/bind'
import styles from './scss/views/create.scss'

const css = classNames.bind(styles)

const Create = () => (
  <div className={css('create-view')}>
    <h2>Create an instance my dude</h2>
    <form
      action="/container"
      method="post"
      className={css('create-form')}
    >
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
