import React from 'react'
// Helpers
import classNames from 'classnames/bind'
// Styles
import styles from './dashboard-link.scss'

const css = classNames.bind(styles)


const DashboardLink = () => (
  <a href="https://feedbacker.site/" className={css('dashboard-button')}>
    Back to dashboard
  </a>
)

export default DashboardLink
