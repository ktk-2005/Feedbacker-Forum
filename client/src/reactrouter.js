import React from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import Create from './create'
import Dashboard from './dashboard-view'

const ReactRouter = () => (
  <Router>
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/create">Create</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
        </ul>
      </nav>

      <Route path="/create" component={Create} />
      <Route path="/dashboard" component={Dashboard} />
    </div>
  </Router>
)

export default ReactRouter
