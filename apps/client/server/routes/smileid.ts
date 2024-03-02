import * as express from 'express'
import smileIdentityCore from 'smile-identity-core'
import { v4 as uuidv4 } from 'uuid';

const WebApi = smileIdentityCore.WebApi

const smileIdRouter = express.Router()

const PARTNER_ID = process.env.SMILEID_PARTNER_ID ?? 'fake-partner-id'
const API_KEY = process.env.SMILEID_API_KEY ?? 'fake-key'
const ENVIRONMENT = process.env.SMILEID_ENVIRONMENT ?? 'sandbox'
const MFONI_API_ADDRESS = process.env.API_ADDRESS;

const connection = new WebApi(PARTNER_ID, null, API_KEY, ENVIRONMENT === 'sandbox' ? '0' : '1');

smileIdRouter.post('/token', async (req, res) => {
  if (!req.body.user_id) {
    return res.status(422).json({error: 'user_id is required'})
  }

  const jobId = uuidv4()
  const callbackUrl = `${MFONI_API_ADDRESS}/api/v1/users/smileid/verify/${jobId}/${req.body.user_id}`
  const product = 'biometric_kyc'
  
  const requestParams = {
    user_id: req.body.user_id,
    job_id: jobId,
    callback_url: callbackUrl,
    product 
  }

  // Generate the web token
  const response = await connection.get_web_token(requestParams)
  return res.json({
    ...response,
    jobId,
    product,
  })
})

export {smileIdRouter}
