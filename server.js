const fs = require('fs')
const config = require('lighter-config')

// Log uncaught exceptions with Cedar.
const log = require('cedar')()
process.on('uncaughtException', error => {
  log.error(error)
  process.exit()
})

// Create HTTPS server.
const express = require('express')
const app = module.exports = express()
const https = require('https')
const port = config.httpsPort.toString()
const suffix = (port === '443') ? '' : `:${port}`

app.server = https.createServer({
  key: fs.readFileSync(`config/ssl/${config.environment}.key`),
  cert: fs.readFileSync(`config/ssl/${config.environment}.cert`)
}, app)
app.server.listen(port, () => {
  log.info(`Server is running at https://localhost${suffix}/`)
})

app.io = require('socket.io')(app.server)

app.use((req, res, next) => {
  if (req.url.startsWith('/video')) req.url = '/'
  next()
})

// Serve static files.
app.use(express.static('public'))

// Serve webpack dev server with hot module reloading.
const webpack = require('webpack')
const webpackConfig = require('./webpack')
const compiler = webpack(webpackConfig)
app.use(require('webpack-hot-middleware')(compiler))
app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true, publicPath: webpackConfig.output.publicPath
}))
