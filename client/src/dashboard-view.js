import React from 'react'
import classNames from 'classnames/bind'
import styles from './scss/views/dashboard-view.scss'
import { Route, Link } from 'react-router-dom'
import Create from './create'

const css = classNames.bind(styles)

const Dashboard = () => (
  <div className={css('dashboard')}>
    <div className={css('top')}>
      <Link to="/site/create">
        <button
          className={css('create-button')}
          type="button"
        >Create new
        </button>
      </Link>
    </div>
    <div>
      <ul />
    </div>
    <Route path="/site/create" component={Create} />
  </div>
)

export default Dashboard
