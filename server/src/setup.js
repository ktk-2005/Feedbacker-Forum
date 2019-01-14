import { promisify } from 'util'
import fs from 'fs'
import childProcess from 'child_process'
import { ArgumentParser } from 'argparse'
import path from 'path'

import { initializeDatabase } from './database'
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

  parser.addArgument(
    ['-w', '--watch'], {
      help: 'Watch for changes in the client directory',
      action: 'storeTrue',
    }
  )

  parser.addArgument(
    ['--listEndpoints'], {
      help: 'Write all endpoints into a JSON file',
      metavar: 'endpoints.json',
    }
  )

  parser.addArgument(
    ['--testApi'], {
      help: 'Run API tests an exit',
      action: 'storeTrue',
    }
  )

  parser.addArgument(
    ['--verbose'], {
      help: 'Print extra information',
      action: 'storeTrue',
    }
  )

  parser.addArgument(
    ['--startProxy'], {
      help: 'Start the proxy executable as well',
      action: 'storeTrue',
    }
  )

  parser.addArgument(
    ['--debugUuid'], {
      help: 'Generate duplicate UUID values for debugging',
      action: 'storeTrue',
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
  const envPort = process.env.APP_SERVER_PORT
  if (envPort) {
    const port = parseInt(envPort, 10)
    if (!Number.isNaN(port) && port >= 1 && port <= 65535) {
      config.port = port
    } else {
      console.error(`Invalid port value specified in APP_SERVER_PORT: ${envPort}`)
    }
  }

  const useTestData = process.env.USE_TEST_DATA
  if (useTestData) {
    config.useTestData = useTestData !== '0'
  }
  config.databaseUrl = process.env.DATABASE_URL
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

  if (configToSet === null) {
    configToSet = await parseConfig('default-config.json', defaultConfigFile)
  }

  Object.assign(config, configToSet)

  overrideConfigFromEnv()

  await initializeDatabase()

  if (args.startProxy) {
    console.log('Starting proxy')
    const proxyExecutable = /^win/.test(process.platform) ? 'proxy.exe' : 'proxy'
    const proxyPath = path.resolve(__dirname, '../../proxy')
    childProcess.spawn(path.resolve(proxyPath, proxyExecutable), [], {
      cwd: proxyPath,
      stdio: 'inherit',
    })
  }

  if (args.watch) {
    console.log('Starting Webpack in watch mode')
    const npmExecutable = /^win/.test(process.platform) ? 'npm.cmd' : 'npm'
    childProcess.spawn(npmExecutable, ['run', 'watch'], {
      cwd: '../client/',
      stdio: 'inherit',
    })
  }

  startServer()
}

startup()

