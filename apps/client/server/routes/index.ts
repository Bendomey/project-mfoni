import * as express from 'express'
import {twitterRouter} from './twitter.js'

const router = express.Router()

router.use('/auth/twitter', twitterRouter)

export {router}
