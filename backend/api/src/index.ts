import ApiConfig from "./api.config" // IMPORTANT: THIS MUST BE THE FIRST IMPORT

import Mongoose from "mongoose"
import App from "./app"
import Logger from "./shared/logger"

App.listen(ApiConfig.PORT, async () => {
  Logger.log(`NODE_ENV='${ApiConfig.NODE_ENV}'`)
  Logger.log(`Starting server on port ${ApiConfig.PORT.toString()}...`)

  // Connect to MongoDB.
  await Mongoose.connect(ApiConfig.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }).catch((err) => {
    Logger.error(err)
    throw err
  })

  Logger.log(`Connected to database ${ApiConfig.MONGODB_URI}`)
})

// Handle mongoose disconnect.
Mongoose.connection.on("disconnected", () => {
  const disconnectedError: Error = new Error(
    `Disconnected from database ${ApiConfig.MONGODB_URI}`
  )
  Logger.error(disconnectedError)
  throw disconnectedError
})

// Handle server shutdown.
process.on("SIGINT", () => {
  Logger.log("Shutting down...")

  Mongoose.disconnect()

  process.exit()
})
