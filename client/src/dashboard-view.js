import React from 'react'
import classNames from 'classnames/bind'
import styles from './scss/views/dashboard-view.scss'

const css = classNames.bind(styles)

const Dashboard = () => (
  <div className={css('dashboard')}>
    <div className={css('top')}>
      <button
        className={css('create-button')}
        type="button"
      >Create new
      </button>
    </div>
    <div>
      <ul />
    </div>
  </div>
)

export default Dashboard
