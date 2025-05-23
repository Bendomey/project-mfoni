import * as express from 'express'
import { authRouter } from './authenticate.js'
import { s3Router } from './s3.js'
import { twitterRouter } from './twitter.js'

const router = express.Router()

router.use('/auth', authRouter)
router.use('/auth/twitter', twitterRouter)
router.use('/s3', s3Router)

export { router }
