import React from 'react'
import * as R from 'ramda'
import classNames from 'classnames/bind'

import styles from './route-container.scss'

const css = classNames.bind(styles)

class RouteContainer extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      hidden: false,
    }
  }

  const groupByRoute = R.groupBy(comment => comment.blob.route)
  const commentsByRoute = R.toPairs(groupByRoute(Object.values(comments)))
    .filter(route => route[0] !== window.location.pathname)
	const amountsByRoute = commentsByRoute.map(route => [route[0], route[1].length])
	const pluralize = (word, amount) => { amount === 1 : word : word.concat('s') }
  return (
    <div className={css('route-container', { hidden })}>
      <button
        type="button"
        className={css('close-button')}
        onClick={onClick}
      />
    <div className={css('route-container', 'hidden', { hidden })}>
      {amountsByRoute.map(route => (
        <p key={route[0]}>
          {route[1]} comments at <a href={route[0]}>{route[0]}</a>
        </p>
      ))}
    </div>
  )
}

export default RouteContainer
