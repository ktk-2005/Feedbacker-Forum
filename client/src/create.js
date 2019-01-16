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
      <input type="text" name="url" />
      Git Hash
      <input type="text" name="version" />
      Type
<<<<<<< HEAD
      <select name="instance_type">
        <option value="Node"> Node </option>
      </select>
=======
      <input type="text" name="type" />
>>>>>>> ecffcbd8214eca61588b8a1c637e5455a3cab09d
      Name
      <input type="text" name="name" />
      <input type="submit" value="Create" />
    </form>
  </div>
)

export default Create
