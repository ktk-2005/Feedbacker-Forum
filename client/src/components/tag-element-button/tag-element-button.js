import React from 'react'
import classNames from 'classnames/bind'
import styles from './tag-element-button.scss'
import { domTagging } from '../../dom-tagging'

const css = classNames.bind(styles)

export const TagElementButton = ({ active, onClick }) => (
  <button
    type="button"
    className={active ? css('button', 'active') : css('button')}
    onClick={onClick}
  >
    <i>C</i>
  </button>
)

export function initializeDomTagging() {
  domTagging()
}
