import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import fs from 'fs'
import { promisify } from 'util'
import childProcess from 'child_process'

import { checkInt, checkBool } from './check'
import { config, args } from './globals'
import apiRoute from './routes/routes'
import { notFound, devErr, prodErr } from './handlers'
import listEndpoints from './list-endpoints'

const writeFile = promisify(fs.writeFile)

export function startServer() {
  const app = express()

  if (checkBool('dev', config.dev)) {
    console.log('Running as development server')
    app.use(express.static('../client/build'))
  }

  app.use(bodyParser.json()) // support json encoded bodies
  app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

  if (!args.testApi)
    app.use(morgan('dev'))

  app.use('/api', apiRoute)

  app.use(notFound)

  if (checkBool('dev', config.dev)) {
    app.use(devErr)
  } else {
    app.use(prodErr)
  }

  if (args.listEndpoints) {
    const endpoints = listEndpoints(app).map(e => `${e.method} ${e.path}`)
    console.log(`Writing ${endpoints.length} endpoints to ${args.listEndpoints}`)
    writeFile(args.listEndpoints, JSON.stringify(endpoints))
    return
  }

  if (args.testApi) {
    // Start a server to a random OS chosen port and run tests
    const server = app.listen(0, () => {
      const { port } = server.address()

      const npmExecutable = /^win/.test(process.platform) ? 'npm.cmd' : 'npm'
      const proc = childProcess.spawn(npmExecutable, ['run', 'test:remoteapi'], {
        stdio: 'inherit',
        env: {
          ...process.env,
          APP_SERVER_PORT: port.toString(),
        },
      })

      proc.on('exit', (code) => {
        process.exitCode = code
        server.close()
      })
    })
  } else {
    // Actual server start
    const port = checkInt('port', config.port)
    app.listen(port, () => {
      console.log(`Running on port ${port}`)
    })
  }
}
