import React from 'react'
import classNames from 'classnames/bind'
import styles from './scss/views/create.scss'

const css = classNames.bind(styles)

const Create = () => (
  <div className={css('create-view')}>
    <h2>Create an instance</h2>
    <form
      action="/api/instances/new"
      method="post"
      className={css('form-create')}
    >
      Git URL
      <input type="text" name="instance_image" />
      Git Hash
      <input type="text" name="instance_version" />
      Type
      <input type="text" name="instance_type" />
      Name
      <input type="text" name="instance_name" />
      <input type="submit" value="Create" />
    </form>
  </div>
)

export default Create