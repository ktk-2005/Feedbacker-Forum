import express from 'express'

import { checkInt, checkBool } from './check'
import { config } from './globals'
import apiVersion from './api/version'

export function startServer() {
  const app = express()

  if (checkBool('dev', config.dev)) {
    console.log('Running as development server')
    app.use(express.static('../client/build'))
    app.use(express.static('../misc'))
  }

  app.use(apiVersion)

  const port = checkInt('port', config.port)
  app.listen(port, () => {
    console.log(`Running on port ${port}`)
  })
}

