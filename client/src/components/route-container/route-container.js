import React from 'react'
import * as R from 'ramda'
import classNames from 'classnames/bind'

import styles from './route-container.scss'

const css = classNames.bind(styles)

function RouteContainer(props) {
  const { hidden, comments } = props
  const groupByRoute = R.groupBy(comment => comment.blob.route)
  const commentsByRoute = R.toPairs(groupByRoute(Object.values(comments)))
    .filter(route => route[0] !== window.location.pathname)
  const amountsByRoute = commentsByRoute.map(route => [route[0], route[1].length])
  return (
    <div className={css('route-container', { hidden })}>
      {amountsByRoute.map(route => (
        <p key={route[0]}>
          {route[1]} comments at <a href={route[0]}>{route[0]}</a>
        </p>
      ))}
    </div>
  )
}

export default RouteContainer
