import fs from 'fs'
import axios from 'axios'
import createError from 'http-errors'
import express, { urlencoded, json } from 'express'
import passport from './middlewares/auth/passport.js'
import path from 'path'
import session from 'express-session'
import { authRoute } from './routes/index.js'
import { logRequest } from './config/logger.js'
import { PORT, SESSION_SECRET, FACEBOOK_HOST_API } from './config/globals.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(logRequest)
app.use(json())
app.use(urlencoded({ extended: false }))

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
)

app.use(passport.initialize())
app.use(passport.session())
app.use('/public', express.static(path.join(__dirname, './public')))

app.set('views', `${__dirname}/views`)
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.redirect('/login')
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.get('/home', (req, res) => {
  res.render('home', { user: req.session.userData })
})

app.get('/albums/:id', async (req, res) => {
  const accessToken = req.query.accessToken
  const url = `${FACEBOOK_HOST_API}/${req.params.id}?fields=name%2Ccreated_time%2Cphotos%7Bid%2Cname%2Ccreated_time%2Clink%2Cpicture%2Cimages%7D&access_token=${accessToken}`
  const response = await axios.get(url)
  res.render('album', { album: response.data })
})

async function listUserPhotos(accessToken) {
  try {
    const url = `${FACEBOOK_HOST_API}/me/photos?limit=1000&type=uploaded&fields=name%2Csource%2Calt_text%2Clink%2Cid%2Ccreated_time&access_token=${accessToken}`
    console.log({ 'listUserPhotos url': url })
    const response = await axios.get(url)
    const photos = response.data.data

    // fs.writeFile('./list_user_photos_data_response.json', JSON.stringify(response.data, null, 2), () => console.log('logged'))

    console.log({ 'photos length': photos.length })
    return photos
  } catch (error) {
    error = error?.response?.data?.error || error
    fs.writeFile(`logs/errors/${Date.now()}-listUserPhotos-error.log`, JSON.stringify(error, null, 2), () => console.log('error logged...'))
    throw new Error(error)
  }
}

app.get('/photos', async (req, res) => {
  const accessToken = req.query.accessToken
  const photos = await listUserPhotos(accessToken)

  const fields = 'id%2Cname%2Clast_name%2Cfirst_name%2Cemail%2Cgender%2Cpicture%2Calbums%7Bid%2Ccover_photo%2Ccreated_time%2Cdescription%2Clink%2Cprivacy%7D'
  const url = `${FACEBOOK_HOST_API}/me?fields=${fields}&access_token=${accessToken}`
  const response = await axios.get(url)
  const user = { profile: response.data }
  res.render('photos', { accessToken, photos, user })
})

app.use('/', authRoute)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status ?? 500)
  res.render('error')
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app
