import React from 'react'
// Helper
import classNames from 'classnames/bind'
// Styles
import styles from './dashboard-link.scss'

const css = classNames.bind(styles)

class DashboardLink extends React.Component {
  constructor(props) {
    super(props)

    this.baseDomain = this.baseDomain.bind(this)
  }

  baseDomain() { // Gets the base domain from the feedback url
    return `//${window.location.origin.match(/([^.]*).(.*)/m)[2]}`
  }


  render() {
    return (
      <a href={this.baseDomain()} className={css('dashboard-button')} tabIndex="-1">
        Back to dashboard
      </a>
    )
  }
}

export default DashboardLink
