import { promisify } from 'util'
import fs from 'fs'

import { ArgumentParser } from 'argparse'
import { startServer } from './server'
import { args, config } from './globals'

const readFile = promisify(fs.readFile)

function parseArguments() {
  const parser = new ArgumentParser({
  })

  parser.addArgument(
    ['-c', '--config'], {
      help: 'Specify configuration .json file',
    }
  )

  const argsToSet = parser.parseArgs()
  Object.assign(args, argsToSet)
}

async function parseConfig(file) {
  try {
    const fileData = await readFile(file)
    const json = JSON.parse(fileData)
    console.log('Loaded configuration from', file)
    return json
  } catch (e) {
    console.error('Failed to read configuration from', file, e)
    throw e
  }
}

function overrideConfigFromEnv() {
  if (process.env.APP_SERVER_PORT !== undefined) {
    const port = parseInt(process.env.APP_SERVER_PORT, 10)
    if (!isNaN(port)) {
      config.port = port
    }
  }
}

export async function startup() {
  parseArguments()

  const defaultConfigFile = 'default-config.json'

  let configToSet = null

  if (args.config) {
    try {
      configToSet = await parseConfig(args.config)
    } catch (e) {
      console.log('Falling back to default configuration file', defaultConfigFile)
    }
  }

  configToSet = await parseConfig('default-config.json', defaultConfigFile)
  Object.assign(config, configToSet)

  overrideConfigFromEnv()

  startServer()
}

startup()

