import cors from 'cors'
import { config } from './globals'

let corsMiddleware = null
export default function() {
  if (!corsMiddleware) {
    corsMiddleware = cors({
      exposedHeaders: [
        'X-Feedback-Retry-Auth',
      ],
      credentials: true,
      origin: new RegExp(config.corsOriginRegex),
    })
  }

  return corsMiddleware
}

