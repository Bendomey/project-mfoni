/* eslint-disable no-inner-declarations */
import * as build from '../build/index.js'
import {router} from './routes/index.js'

import {createRequestHandler} from '@remix-run/express'
import {broadcastDevReady} from '@remix-run/node'
import express from 'express'
import getPort, {portNumbers} from 'get-port'
import closeWithGrace from 'close-with-grace'
import address from 'address'
import chalk from 'chalk'
import path from 'path'
import chokidar from 'chokidar'
import {fileURLToPath} from 'url'

const MODE = process.env.NODE_ENV
const BUILD_PATH = '../build/index.js'

let devBuild = build

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(express.static('public'))

app.use('/api', router)

app.all('*', createRequestHandler({build: devBuild as any, mode: MODE}))

const desiredPort = Number(process.env.PORT ?? 3000)
const portToUse = await getPort({
  port: portNumbers(desiredPort, desiredPort + 100),
})

const server = app.listen(portToUse, () => {
  const addy = server.address()
  const portUsed =
    desiredPort === portToUse
      ? desiredPort
      : addy && typeof addy === 'object'
        ? addy.port
        : 0

  if (portUsed !== desiredPort) {
    console.warn(
      chalk.yellow(
        `⚠️  Port ${desiredPort} is not available, using ${portUsed} instead.`,
      ),
    )
  }
  const localUrl = `http://localhost:${portUsed}`
  let lanUrl: string | null = null
  const localIp = address.ip()
  // Check if the address is a private ip
  // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
  // https://github.com/facebook/create-react-app/blob/d960b9e38c062584ff6cfb1a70e1512509a966e7/packages/react-dev-utils/WebpackDevServerUtils.js#LL48C9-L54C10
  if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(localIp)) {
    lanUrl = `http://${localIp}:${portUsed}`
  }

  console.log(
    `
  ${chalk.bold('Local:')}            ${chalk.cyan(localUrl)}
  ${lanUrl ? `${chalk.bold('On Your Network:')}  ${chalk.cyan(lanUrl)}` : ''}
  ${chalk.bold('Press Ctrl+C to stop')}
  		`.trim(),
  )

  if (MODE === 'development') {
    void broadcastDevReady(build as any)
  }
})

closeWithGrace(() => {
  return Promise.all([
    new Promise((resolve, reject) => {
      server.close(e => (e ? reject(e) : resolve('ok')))
    }),
  ])
})

// during dev, we'll keep the build module up to date with the changes
if (process.env.NODE_ENV === 'development') {
  async function reloadBuild() {
    devBuild = await import(`${BUILD_PATH}?update=${Date.now()}`)
    void broadcastDevReady(devBuild as any)
  }

  const dirname = path.dirname(fileURLToPath(import.meta.url))
  const watchPath = path.join(dirname, BUILD_PATH).replace(/\\/g, '/')
  const watcher = chokidar.watch(watchPath, {ignoreInitial: true})
  watcher.on('all', reloadBuild)
}
