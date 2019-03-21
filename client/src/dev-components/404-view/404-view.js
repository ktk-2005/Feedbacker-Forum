import React from 'react'
// Helpers
import { Link } from 'react-router-dom'
import classNames from 'classnames/bind'
// Styles
import styles from './404-view.scss'

const css = classNames.bind(styles)

const View404 = () => (
  <div className={css('center-center-block')}>
    <div className={css('view-404')}>
      <h1 data-text="404">404</h1>
      <p>
        Looks like there is nothing here, go back to dashboard.
      </p>
      <Link to="/" tabIndex="-1">
        <button
          className={css('dashboard-button')}
          type="button"
        >
          Back to dashboard
        </button>
      </Link>
    </div>
  </div>
)

export default View404
