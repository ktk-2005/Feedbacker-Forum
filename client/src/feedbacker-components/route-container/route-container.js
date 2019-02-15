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
    this.hide = this.hide.bind(this)
    this.expand = this.expand.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
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

  expand() {
    if (this.state.hidden) {
      this.setState({ hidden: false })
    }
  }

  hide(event) {
    event.stopPropagation()
    this.setState({ hidden: true })
  }

  handleKeyDown(event) {
    if (event.key === 'Enter') {
      this.expand()
    }
  }

  render() {
    const amountsByRoute = this.getRouteComments()
    if (amountsByRoute.length > 0) {
      return (
        <div
          className={css('route-container', { hidden: this.state.hidden })}
          onClick={this.expand}
          role="button"
          tabIndex={0}
          onKeyDown={this.handleKeyDown}
        >
          {amountsByRoute.map(route => (
            <p key={route[0]}>
              {route[1]} {this.pluralize('comment', route[1])} at{' '}
              <a href={route[0]}>{route[0]}</a>
            </p>
          ))}
          <button type="button" onClick={this.hide}>
            Collapse
          </button>
        </div>
      )
    }
    return null
  }
}

export default RouteContainer
