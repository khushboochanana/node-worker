process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import config from './config'
import EventWorker from './worker'
console.log(config)
const MONGO_URL = config.MONGODB.url

mongooseConection().catch(err => console.log(err))
async function mongooseConection () {
  await mongoose.connect(MONGO_URL)
}
const app: express.Application = express()
const port = process.env.PORT || 5000
app.use(bodyParser.json())

new EventWorker()

app.use((err: any, req: any, res: any, next: any) => {
  if (res.headersSent) {
    return next(err)
  }
  console.log(err)
  res.status(err.status || 500).send(err)
})

app.listen(port, () => {
  console.log('App is running at port:' + port)
})

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p)
  })
  .on('uncaughtException', function (err) {
    console.error(new Date().toUTCString() + ' uncaughtException:', err.message)
    console.error(err.stack)
    process.exit(1)
  })
