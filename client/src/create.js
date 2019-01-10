import React from 'react'
import classNames from 'classnames/bind'
import styles from './scss/views/create.scss'

const css = classNames.bind(styles)

const Create = () => (
  <div className={css('create-view')}>
    <h2>Create an instance</h2>
    <form
      action="/container"
      method="post"
      className={css('form-create')}
    >
      Git URL
      <input type="text" name="name" />
      Git Hash
      <input type="text" name="name" />
      Type
      <input type="text" name="name" />
      Name
      <input type="text" name="name" />
      <input type="submit" value="Create" />
    </form>
  </div>
)

export default Create
