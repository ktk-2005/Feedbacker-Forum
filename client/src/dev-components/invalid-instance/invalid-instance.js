import React from 'react'
// Helpers
import classNames from 'classnames/bind'
// Styles
import styles from './invalid-instance.scss'

const css = classNames.bind(styles)

const subdomain = window.location.host.split('.')[0]

const InvalidInstance = () => (
  <div className={css('center-center-block')}>
    <div className={css('instance-view')}>
      <h1>Feedback instance doesn&apos;t exist: {subdomain}</h1>
      <p>You should contact the host of of the instance</p>
    </div>
  </div>
)

export default InvalidInstance
