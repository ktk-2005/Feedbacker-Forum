import React from 'react'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import Create from './create'

const All = () => <h2>HuutistaJokaTuutista</h2>

const ReactRouter = () => (
  <Router>
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/create">Create</Link>
          </li>
          <li>
            <Link to="/all">All</Link>
          </li>
        </ul>
      </nav>

      <Route path="/create" component={Create} />
      <Route path="/all" component={All} />
    </div>
  </Router>
)

export default ReactRouter
