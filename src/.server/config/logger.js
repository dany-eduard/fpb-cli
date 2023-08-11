import logger from 'pino-http'
import { NODE_ENV } from './globals.js'

export const logRequest = logger({
  enabled: Boolean(NODE_ENV === 'development')
})
