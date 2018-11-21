import express from 'express'
import fs from 'fs'
import { promisify } from 'util'

import { checkInt, checkBool } from './check'
import { config, args } from './globals'
import apiVersion from './api/version'
import listEndpoints from './list-endpoints'

const writeFile = promisify(fs.writeFile)

export function startServer() {
  const app = express()

  if (checkBool('dev', config.dev)) {
    console.log('Running as development server')
    app.use(express.static('../client/build'))
    app.use(express.static('../misc'))
  }

  app.use('/api/version', apiVersion)

  if (args.listEndpoints) {
    const endpoints = listEndpoints(app).map(e => `${e.method} ${e.path}`)
    console.log(`Writing ${endpoints.length} endpoints to ${args.listEndpoints}`)
    writeFile(args.listEndpoints, JSON.stringify(endpoints))
    return
  }

  const port = checkInt('port', config.port)
  app.listen(port, () => {
    console.log(`Running on port ${port}`)
  })
}

