import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import fs from 'fs'
import { promisify } from 'util'
import childProcess from 'child_process'
import proxy from 'express-http-proxy'
import path from 'path'
import delay from 'express-delay'

import { checkInt, checkBool } from './check'
import { config, args } from './globals'
import apiRoute from './routes/routes'
import { notFound, devErr, prodErr } from './handlers'
import listEndpoints from './list-endpoints'
import cors from './cors'

const writeFile = promisify(fs.writeFile)

function matchSubdomain(fn, target) {
  return (req, res, next) => {
    const host = process.env.APP_DOMAIN || 'localhost'
    if (req.hostname !== host) {
      const subdomain = req.hostname.split('.')
      if (subdomain.length > 1 && subdomain[0] === target) return fn(req, res, next)
    }
    return next()
  }
}

function anySubdomain(fn) {
  return (req, res, next) => {
    const host = process.env.APP_DOMAIN || 'localhost'
    if (req.hostname !== host) {
      return fn(req, res, next)
    }
    return next()
  }
}

export function startServer() {
  const app = express()

  if (args.delay) app.use(delay(args.delay))

  if (checkBool('dev', config.dev)) {
    console.log('Running as development server')
    app.use(matchSubdomain(express.static('../client/build/test'), 'test'))
    app.use(matchSubdomain(express.static('../client/build/other'), 'other'))
    app.use(anySubdomain(proxy('localhost:8086', {
      preserveHostHdr: true,
      skipToNextHandlerFilter: () => false,
    })))
    app.use(express.static(path.join(__dirname, '../../client/build')))
  }

  if (!config.cookieSecret) {
    console.error('You must specify either cookieSecret config or APP_COOKIE_SECRET env variable')
    return
  }

  app.use(cookieParser(config.cookieSecret))

  app.options('*', cors())

  app.use(bodyParser.json()) // support json encoded bodies
  app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

  if (!args.testApi) {
    app.use(morgan('dev'))
  }

  app.use('/api', apiRoute)

  // redirect /* urls modified by react router
  app.use('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'))
  })

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
