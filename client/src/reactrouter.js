import React from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import Create from './create'
import Dashboard from './dashboard-view'
import Build from './build-view'

const ReactRouter = () => (
  <Router>
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/site/create">Create</Link>
          </li>
          <li>
            <Link to="/site/dashboard">Dashboard</Link>
          </li>
        </ul>
      </nav>

      <Route path="/site/create" component={Create} />
      <Route path="/site/dashboard" component={Dashboard} />
      <Route path="/site/build-view/:name" component={Build} />
    </div>
  </Router>
)

export default ReactRouter
