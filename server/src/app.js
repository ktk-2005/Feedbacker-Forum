const express = require('express')
const path = require('path')
var bodyParser = require('body-parser')
const app = express()
const commentRoute = require('./routes/comments')
import { config } from './globals'
import { checkInt, checkBool } from './check'
import apiVersion from './api/version'

// bodyparser
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

app.use(apiVersion)

if (checkBool('dev', config.dev)) {
  console.log('Running as development server')
  app.use(express.static('../client/build'))
  app.use(express.static('../misc'))
}
//routes
app.use('/api', commentRoute)

const port = checkInt('port', config.port)
app.listen(port, () => {
  console.log(`Running on port ${port}`)
})
