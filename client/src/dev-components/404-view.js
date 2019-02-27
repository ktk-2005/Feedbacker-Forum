import React from 'react'
// Helpers
import { Link } from 'react-router-dom'
import classNames from 'classnames/bind'
// Styles
import styles from '../scss/views/404-view.scss'

const css = classNames.bind(styles)

const View404 = () => (
  <div className={css('center-center-block')}>
    <div className={css('view-404')}>
      <h2>404</h2>
      <div className={css('text')}>There is nothing here, go back to dashboard</div>
      <Link to="/">
        <button
          className={css('dashboard-button')}
          type="button"
        >Back to dashboard
        </button>
      </Link>
    </div>
  </div>
)

export default View404
