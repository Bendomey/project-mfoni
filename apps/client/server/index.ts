import * as build from '../build/index.js'

import {createRequestHandler} from '@remix-run/express'
import {broadcastDevReady} from '@remix-run/node'
import express from 'express'
import {router} from './routes/index.js'

const MODE = process.env.NODE_ENV

const app = express()
app.use(express.static('public'))

app.all('*', createRequestHandler({build: build as any, mode: MODE}))

app.use(router)

app.listen(3000, () => {
  if (MODE === 'development') {
    void broadcastDevReady(build as any)
  }
  console.log('App listening on http://localhost:3000')
})
