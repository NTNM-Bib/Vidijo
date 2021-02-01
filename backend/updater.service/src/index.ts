import UpdaterConfig from './updater.config'

import Mongoose from 'mongoose'
import Logger from 'vidijo-lib/lib/logger'
import { updateOldestJournal } from './updater'

// Connect to MongoDB
function connectToDatabase() {
  return Mongoose.connect(UpdaterConfig.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
}

// Update articles in a set interval
function updateArticlesLoop() {
  updateOldestJournal()
    .then(() => {
      return setTimeout(
        updateArticlesLoop,
        UpdaterConfig.UPDATE_INTERVAL * 60 * 1000
      ) // convert to ms
    })
    .catch(Logger.error)
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
process.on('unhandledRejection', (reason, _) => {
  Logger.error(new Error(`Unhandled promise rejection: ${reason}.`))
  Logger.log('Terminating application...')
  return process.exit(-1)
})

// =-- Main --=
Logger.log('Starting updater service...')
Logger.log(`NODE_ENV=${UpdaterConfig.NODE_ENV}`)

Logger.log(`Connecting to database ${UpdaterConfig.MONGODB_URI}`)
connectToDatabase()
  .then((_) => {
    Logger.log(`Connected to the database`)

    Logger.log(
      `Updating articles every ${UpdaterConfig.UPDATE_INTERVAL} minutes`
    )
    updateArticlesLoop()
  })
  .catch((err: Error) => {
    Logger.error(err)
    return process.exit(-1)
  })
