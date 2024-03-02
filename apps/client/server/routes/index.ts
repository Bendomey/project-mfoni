import * as express from 'express'
import {twitterRouter} from './twitter.js'
import {smileIdRouter} from './smileid.js'
import {authRouter} from './authenticate.js'

const router = express.Router()

router.use('/auth', authRouter)
router.use('/smileid', smileIdRouter)
router.use('/auth/twitter', twitterRouter)

export {router}
