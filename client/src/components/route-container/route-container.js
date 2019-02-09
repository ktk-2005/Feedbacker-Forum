import React from 'react'
import * as R from 'ramda'
import classNames from 'classnames/bind'

import styles from './route-container.scss'

const css = classNames.bind(styles)

class RouteContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hidden: true,
    }
    this.handleClick = this.handleClick.bind(this)
  }

  getRouteComments() {
    const groupByRoute = R.groupBy(comment => comment.blob.route)
    const commentsByRoute = R.toPairs(
      groupByRoute(Object.values(this.props.comments))
    ).filter(route => route[0] !== window.location.pathname)
    const amountsByRoute = commentsByRoute.map(route => [
      route[0],
      route[1].length,
    ])
    return amountsByRoute
  }

  pluralize(word, amount) {
    if (amount === 1) {
      return word
    }
    return word.concat('s')
  }

  handleClick() {
    this.setState(state => ({ hidden: !state.hidden }))
  }

  render() {
    const amountsByRoute = this.getRouteComments()
    return (
      <div>
        <button type="button" onClick={this.handleClick}>
          fad
        </button>
        <div className={css('route-container', { hidden: this.state.hidden })}>
          {amountsByRoute.map(route => (
            <p key={route[0]}>
              {route[1]} {this.pluralize('comment', route[1])} at{' '}
              <a href={route[0]}>{route[0]}</a>
            </p>
          ))}
        </div>
      </div>
    )
  }
}

export default RouteContainer
