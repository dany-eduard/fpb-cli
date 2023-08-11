import passport from '../middlewares/auth/passport.js'
import { Router } from 'express'

const router = Router()

router.get('/auth/facebook', passport.authenticate('facebook'))

router.get('/auth/redirect/facebook', passport.authenticate('facebook', { failureRedirect: '/', scope: ['email'] }), (req, res) => {
  req.session.userData = req.user
  res.redirect('/home')
})

export default router
