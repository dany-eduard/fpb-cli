import dotenv from 'dotenv'
dotenv.config()

export const PORT = process.env.PORT || 3000
export const SESSION_SECRET = process.env.SESSION_SECRET || 'secret-ultra-secret'
export const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID
export const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET
export const FACEBOOK_HOST_API = process.env.FACEBOOK_HOST_API

export const db = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'password'
}

export const NODE_ENV = process.env.NODE_ENV || 'development'
export const DEVELOPMENT = NODE_ENV === 'development'
