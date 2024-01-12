import * as express from 'express'
import {obtainOauthRequestToken} from '../utils/twitter/oauth1.js'

const BASE_URL = 'https://api.twitter.com'
const twitterRouter = express.Router()

const CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY ?? ''
const CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET ?? ''

twitterRouter.post('/', async (req, res) => {
  const obtainRequestTokenConfig = {
    apiUrl: `${BASE_URL}/oauth/request_token`,
    callbackUrl: req.body.callbackUrl ?? '',
    consumerKey: CONSUMER_KEY,
    consumerSecret: CONSUMER_SECRET,
    method: 'POST',
  }

  const requestTokenData = await obtainOauthRequestToken(
    obtainRequestTokenConfig,
  )

  return res.json(requestTokenData)
})

export {twitterRouter}
