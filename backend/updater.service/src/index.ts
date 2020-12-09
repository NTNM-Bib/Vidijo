import UpdaterConfig from './updater.config'

import Mongoose from 'mongoose'
import { Logger } from 'vidijo-lib'
import * as Updater from './updater'

// Connect to MongoDB
async function connectToDatabase() {
  const promise: Promise<string> = new Promise(async (resolve, reject) => {
    Mongoose.connect(UpdaterConfig.MONGODB_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
      .then(() => {
        return resolve(`${UpdaterConfig.MONGODB_URI}`)
      })
      .catch((err) => {
        Logger.error(err)
        return reject(err)
      })
  })

  return promise
}

// Update articles in a set interval
function updateArticlesLoop() {
  Updater.updateOldestJournal()
    .then(() => {
      return setTimeout(
        updateArticlesLoop,
        UpdaterConfig.UPDATE_INTERVAL * 60 * 1000
      ) // convert to ms
    })
    .catch((err: Error) => {
      Logger.error(err)
      return process.exit(-1) // exit with non-zero code
    })
}

// Handle mongoose disconnect
Mongoose.connection.on('disconnected', () => {
  const disconnectedError: Error = new Error(
    `Disconnected from database ${UpdaterConfig.MONGODB_URI}`
  )
  Logger.error(disconnectedError)
  return process.exit(-1)
})

// Handle server shutdown
process.on('SIGINT', () => {
  Logger.log('Shutting down...')

  Mongoose.disconnect()
  return process.exit(0)
})

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  Logger.error(
    new Error(
      `Unhandled promise rejection at: promise ${JSON.stringify(
        promise
      )}, reason: ${reason}.`
    )
  )
  Logger.log('Terminating application...')
  return process.exit(-1)
})

// =-- Main --=
Logger.log('Starting updater service...')
Logger.log(`NODE_ENV=${UpdaterConfig.NODE_ENV}`)

Logger.log(`Connecting to database ${UpdaterConfig.MONGODB_URI}`)
connectToDatabase()
  .then((databaseUrl: string) => {
    Logger.log(`Connected to database ${databaseUrl}`)

    Logger.log(
      `Updating articles every ${UpdaterConfig.UPDATE_INTERVAL} minutes`
    )
    updateArticlesLoop()
  })
  .catch((err: Error) => {
    Logger.error(err)
    return process.exit(-1)
  })
