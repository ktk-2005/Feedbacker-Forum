import React from 'react'
// Helpers
import ReactDOM from 'react-dom'
import classNames from  'classnames/bind'
import { prepareReactRoot } from './shadowDomHelper'
import InvalidInstance from './dev-components/invalid-instance/invalid-instance'
// Styles
import styles from './scss/_base.scss'


const css = classNames.bind(styles)
ReactDOM.render(
  <div className={css('feedback-app-container', 'site-views')}>
    <InvalidInstance />
  </div>,
  prepareReactRoot()
)
