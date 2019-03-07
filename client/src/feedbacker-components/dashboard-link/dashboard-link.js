import React from 'react'
// Helpers
import classNames from 'classnames/bind'
// Styles
import styles from './dashboard-link.scss'

const css = classNames.bind(styles)

function url() {
  return `https://${window.location.hostname.match(/([^.]*).(.*)/m)[2]}`
}

const DashboardLink = () => (
  <a href={url()} className={css('dashboard-button')}>
    Back to dashboard
  </a>
)

export default DashboardLink
