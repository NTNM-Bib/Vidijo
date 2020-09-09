import UserConfig from "./user.config"; // IMPORTANT: THIS MUST BE THE FIRST IMPORT

import Mongoose from "mongoose";
import App from "./app";
import Logger from "./shared/logger";


App.listen(UserConfig.PORT, async () => {
  Logger.log(`NODE_ENV='${UserConfig.NODE_ENV}'`);
  Logger.log(`Starting server on port ${UserConfig.PORT.toString()}...`);

  // Connect to MongoDB.
  await Mongoose.connect(UserConfig.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  }).catch(err => {
    Logger.error(err);
    throw err;
  });

  Logger.log(`Connected to database ${UserConfig.MONGODB_URI}`);
});


// Handle mongoose disconnect.
Mongoose.connection.on("disconnected", () => {
  const disconnectedError: Error = new Error(`Disconnected from database ${UserConfig.MONGODB_URI}`);
  Logger.error(disconnectedError);
  throw disconnectedError;
});


// Handle server shutdown.
process.on("SIGINT", () => {
  Logger.log("Shutting down...");

  Mongoose.disconnect();

  process.exit();
});
