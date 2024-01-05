import * as express from 'express'
import {obtainOauthAccessToken, obtainOauthRequestToken} from 'server/utils/oauth1.js'

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

// TODO: Migrate this check to server side
twitterRouter.post('/authorize', async (req, res) => {
  const obtainAccessTokenConfig = {
    apiUrl: `${BASE_URL}/oauth/access_token`,
    callbackUrl: req.body.callbackUrl ?? '',
    consumerKey: CONSUMER_KEY,
    consumerSecret: CONSUMER_SECRET,
    oauthToken: req.body.oauthToken ?? '',
    oauthVerifier: req.body.oauthVerifier ?? '',
    method: 'POST',
  }

  const accessTokenData = await obtainOauthAccessToken(
    obtainAccessTokenConfig,
  )

  return res.json(accessTokenData)
})

export {twitterRouter}
