import React from 'react'
import classNames from 'classnames/bind'

import { shadowDocument } from './shadowDomHelper'
import apiCall from './api-call'
import styles from './scss/views/auth-view.scss'

const css = classNames.bind(styles)

function AuthorizationView() {
  const subdomain = window.location.host.split('.')[0]

  async function submitAuthTry(event) {
    event.preventDefault()

    const password = shadowDocument().getElementById('password').value
    await apiCall('POST', '/authorization', { password, subdomain })
    window.location.reload()
  }

  return (
    <div className={css('auth-container')}>
      <div className={css('dialog')}>
        <h1>Authorization</h1>
        <p>You are not authorized to access the container <code>{subdomain}</code></p>
        <form className={css('form')}>
          <input type="password" placeholder="Password" id="password" />
          <input type="submit" onClick={submitAuthTry} />
        </form>
      </div>
    </div>
  )
}

export default AuthorizationView
