import React from 'react'
import classNames from 'classnames/bind'
import styles from './scss/views/create.scss'
import { Route, Link } from 'react-router-dom'
import Build from './build-view'

const css = classNames.bind(styles)

const Create = () => (
  <div className={css('create-view')}>
    <h2>Create an instance</h2>
    <form
      action="/site/build"
      method="post"
      className={css('form-create')}
    >
      Type
      <select name="type">
        <option value="node"> Node </option>
      </select>
      Git URL
      <input type="text" name="url" />
      Git Hash
      <input type="text" name="version" />
      Name
      <input type="text" name="name" />
      Port
      <input type="number" min="1" max="65535" name="port" />
      <input type="submit" value="Create" />
    </form>
    <Route path="/site/build" component={Build} />
  </div>
)

export default Create
