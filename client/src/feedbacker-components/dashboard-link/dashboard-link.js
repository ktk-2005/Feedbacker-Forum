import React from 'react'
// Helpers
import { connect } from 'react-redux'
import classNames from 'classnames/bind'
// Styles
import styles from './dashboard-link.scss'

const css = classNames.bind(styles)

const mapStateToProps = state => ({
  role: state.role,
})

class DashboardLink extends React.Component {
  constructor(props) {
    super(props)

    this.baseDomain = this.baseDomain.bind(this)
  }

  baseDomain() { // gets the base domain from the feedback url
    return `//${window.location.origin.match(/([^.]*).(.*)/m)[2]}`
  }


  render() {
    return (
      <a href={this.baseDomain()} className={css('dashboard-button')}>
        Back to dashboard
      </a>
    )
  }
}

export default connect(mapStateToProps)(DashboardLink)
