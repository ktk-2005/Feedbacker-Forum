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
      <h1>Instance inaccessible: {subdomain}</h1>
      <p>
        The instance you&apos;re trying to access does not exist or is still building.
        Try again later or contact the person who sent you the link.
      </p>
    </div>
  </div>
)

export default InvalidInstance
