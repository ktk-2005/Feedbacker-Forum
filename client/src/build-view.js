import React from 'react'
import classNames from 'classnames/bind'
import styles from './scss/views/build-view.scss'

const css = classNames.bind(styles)

const Build = () => (
  <div className={css('build-view-container')}>
    <h3>Build...</h3>
  </div>
)

export default Build
