import ExternalDataConfig from "./external-data.config"; // IMPORTANT: THIS MUST BE THE FIRST IMPORT

import Mongoose from "mongoose";
import App from "./app";
import Logger from "./shared/logger";

App.listen(ExternalDataConfig.PORT, async () => {
  Logger.log(`NODE_ENV='${ExternalDataConfig.NODE_ENV}'`);
  Logger.log(
    `Starting server on port ${ExternalDataConfig.PORT.toString()}...`
  );

  // Connect to MongoDB.
  await Mongoose.connect(ExternalDataConfig.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  }).catch((err) => {
    Logger.error(err);
    throw err;
  });

  Logger.log(`Connected to database ${ExternalDataConfig.MONGODB_URI}`);
});

// Handle mongoose disconnect.
Mongoose.connection.on("disconnected", () => {
  const disconnectedError: Error = new Error(
    `Disconnected from database ${ExternalDataConfig.MONGODB_URI}`
  );
  Logger.error(disconnectedError);
  throw disconnectedError;
});

// Handle server shutdown.
process.on("SIGINT", () => {
  Logger.log("Shutting down...");

  Mongoose.disconnect();

  process.exit();
});
