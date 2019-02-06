import { createLogger, format, transports } from 'winston'
import { NestedError } from './errors'

const { combine, timestamp, printf } = format

function devFormat() {
  function formatNestedError(info) {
    function getDataString(error) {
      return error.data ? `\nData: ${JSON.stringify(error.data)}\n` : ''
    }

    function appendNestedInfo(error, base) {
      const newBase = `${base}\n-----\n${getDataString(error)}Caused by:\n\n${error.stack}`

      if (!error.cause) {
        return `${newBase}\n-------------------------------------`
      }

      return appendNestedInfo(error.cause, newBase)
    }
    const base = `-------------------------------------\n${info.level}: ${info.timestamp}`

    return appendNestedInfo(info, base)
  }

  const formatMessage = info => `${info.level}: ${info.timestamp} ${info.message}`

  function format(info) {
    if (info instanceof NestedError || info instanceof Error) {
      return formatNestedError(info)
    }

    return formatMessage(info)
  }

  return combine(timestamp(), printf(format))
}

export default createLogger({
  transports: [
    new transports.Console(),
  ],
  format: devFormat(),
})
