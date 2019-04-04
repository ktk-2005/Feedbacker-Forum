import cors from 'cors'
import { config } from './globals'

// @api OPTIONS /*
// Return CORS headers for all OPTIONS requests
let corsMiddleware = null
export default function () {
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

