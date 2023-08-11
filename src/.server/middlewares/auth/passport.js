import axios from 'axios'
import passport from 'passport'
import { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_HOST_API } from '../../config/globals.js'
import { Strategy as FacebookStrategy } from 'passport-facebook'

passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID || '',
      clientSecret: FACEBOOK_APP_SECRET || '',
      callbackURL: '/auth/redirect/facebook'
    },
    function verify(accessToken, refreshToken, profile, next) {
      const user = { accessToken, refreshToken, profile }
      const fields = 'id%2Cname%2Clast_name%2Cfirst_name%2Cemail%2Cgender%2Cpicture%2Calbums%7Bid%2Ccover_photo%2Ccreated_time%2Cdescription%2Clink%2Cprivacy%7D'
      const url = `${FACEBOOK_HOST_API}/me?fields=${fields}&access_token=${accessToken}`
      axios
        .get(url)
        .then(function (response) {
          user.profile = { ...profile, ...response.data }
          return next(null, user)
        })
        .catch(() => {
          return next(null, user)
        })
        .finally(() => {
          console.log('user:', JSON.stringify(user))
        })
    }
  )
)

passport.serializeUser(function (user, next) {
  process.nextTick(function () {
    next(null, { user })
  })
})

passport.deserializeUser(function (user, next) {
  process.nextTick(function () {
    return next(null, user)
  })
})

export default passport
