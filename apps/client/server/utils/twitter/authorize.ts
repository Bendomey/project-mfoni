import {obtainOauthAccessToken} from './oauth1.js'

const BASE_URL = 'https://api.twitter.com'
const CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY ?? ''
const CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET ?? ''

interface InputParams {
  oAuthToken: string
  oAuthVerifier: string
}

export const authorizeTwitter = async ({
  oAuthToken,
  oAuthVerifier,
}: InputParams) => {
  const obtainAccessTokenConfig = {
    apiUrl: `${BASE_URL}/oauth/access_token`,
    consumerKey: CONSUMER_KEY,
    consumerSecret: CONSUMER_SECRET,
    oauthToken: oAuthToken,
    oauthVerifier: oAuthVerifier,
    method: 'POST',
  }

  const accessTokenData = await obtainOauthAccessToken(obtainAccessTokenConfig)

  if (!accessTokenData.user_id) {
    // send to sentry
    throw new Error('NoUserIdFound')
  }

  if (!accessTokenData.screen_name) {
    // send to sentry
    throw new Error('NoUserNameFound')
  }


  return {
    uid: accessTokenData.user_id,
    name: accessTokenData.screen_name,
    
    // @TODO: verify dets after twitter approves our app!
    // email: payload?.email,
    // userPhoto: payload?.picture,
  }
}
