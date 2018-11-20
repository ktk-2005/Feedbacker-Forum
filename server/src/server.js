import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import { checkInt, checkBool } from './check'
import { config } from './globals'
import apiVersion from './routes/version'
import commentRoute from './routes/comments'
import versionRoute from './routes/version'

export function startServer() {
  const app = express()

  if (checkBool('dev', config.dev)) {
    console.log('Running as development server')
    app.use(express.static('../client/build'))
  }

  app.use(bodyParser.json()) // support json encoded bodies
  app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

  app.use('/api/version', versionRoute)
  app.use('/api', commentRoute)

  app.use(apiVersion)

  const port = checkInt('port', config.port)
  app.listen(port, () => {
    console.log(`Running on port ${port}`)
  })
}
