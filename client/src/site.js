import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers } from 'redux'
import classNames from 'classnames/bind'
import * as R from 'ramda'
import { setupPersist } from './persist'
import { apiUrl } from './meta/env.meta'
import styles from './scss/_base.scss'
import ReactRouter from './reactrouter'

const css = classNames.bind(styles)

const initializedKey = '!!feedbacker_forum_initialized!!'

const initialize = () => {
  if (window[initializedKey] || !document.body) {
    return
  }

  window[initializedKey] = true

  ReactDOM.render(
    <div className={css('feedback-app-main-container')}>
      <ReactRouter />
    </div>,
    document.getElementById('root')
  )
}

initialize()
document.addEventListener('DOMContentLoaded', initialize)
window.addEventListener('load', initialize)
