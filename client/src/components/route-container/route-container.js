import React from 'react'
import * as R from 'ramda'
import classNames from 'classnames/bind'

import styles from './route-container.scss'

const css = classNames.bind(styles)

function RouteContainer(props) {
  const { hidden, comments } = props
  const groupByRoute = R.groupBy(comment => comment.blob.route)
  const commentsByRoute = R.toPairs(groupByRoute(Object.values(comments)))
  const amountsByRoute = commentsByRoute.map(route => [route[0], route[1].length])
  return (
    <div className={css('panel-container', { hidden })}>
      {amountsByRoute.map(route => (
        <a key={route[0]} href={route[0]}>
          <p>{route[1]} comments at {route[0]}</p>
        </a>
      ))}
    </div>
  )
}

export default RouteContainer
