import { promisify } from 'util'
import fs from 'fs'
import { ArgumentParser } from 'argparse'
import { checkInt } from './check'
import { startServer } from './server'

const readFile = promisify(fs.readFile)

// Command line arguments
export let args = { }

// Configuration .json file contents
export let config = { }

function parseArguments() {
  const parser = new ArgumentParser({
  })

  parser.addArgument(
    ['-c', '--config'], {
      help: 'Specify configuration .json file',
    }
  )

  args = parser.parseArgs()
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

export async function startup() {
  parseArguments()

  const defaultConfigFile = 'default-config.json'

  if (args.config) {
    try {
      config = await parseConfig(args.config)
    } catch (e) {
      console.log('Falling back to default configuration file', defaultConfigFile)
    }
  }

  config = await parseConfig('default-config.json', defaultConfigFile)
  startServer()
}

startup()

