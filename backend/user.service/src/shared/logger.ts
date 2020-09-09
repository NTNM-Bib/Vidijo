import DefaultConfig from "./default.config";
import Winston from "winston";
import { TransformableInfo } from "logform";
import Colors from "colors";

import WinstonDailyRotateFile from "winston-daily-rotate-file";  // IMPORTANT: keep this import for DailyRotateFile usage
require("winston-daily-rotate-file"); // IMPORTANT: this import must also stay for DailyRotateFile usage


class Logger {

  private dailyRotateTransport = new (Winston.transports.DailyRotateFile)({
    format: Winston.format.combine(
      Winston.format.timestamp({
        format: "HH:mm:ss"
      }),
      Winston.format.printf((info: TransformableInfo) => {
        return `${info.timestamp} ${info.level}: ${info.message}`;
      })
    ),
    dirname: 'logs',
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,  // compress old log files
    maxSize: '20m', // 20MB max. file size
    maxFiles: '14d' // keep the last 14 days
  });


  private consoleTransport = new (Winston.transports.Console)({
    format: Winston.format.combine(
      Winston.format.colorize(),
      Winston.format.timestamp({
        format: "HH:mm:ss"
      }),
      Winston.format.printf((info: TransformableInfo) => {
        return `${info.timestamp} ${info.level}: ${info.message}`;
      })
    )
  });


  private logger: Winston.Logger = Winston.createLogger({
    transports: [
      this.dailyRotateTransport
    ]
  });


  constructor() {
    // Only log to console in debug mode.
    if (DefaultConfig.NODE_ENV === "development") {
      this.logger.add(this.consoleTransport);
    }
  }


  // Log a message
  public log(message: string) {
    this.logger.info(message);
  }


  // Log a warning
  public warn(warning: string) {
    this.logger.warn(warning);
  }


  // Log an error
  public error(error: Error) {
    if (error.stack) {
      this.logger.error(error.stack);
    }
    else if (error.message) {
      this.logger.error(error.message);
    }
    else {
      this.logger.error("Invalid error was passed to Logger.error()");
    }
  }


  // Debug log any Object (only in development environment)
  public debug(object: any) {
    if (DefaultConfig.NODE_ENV !== "development") {
      return;
    }

    const currentTime: string = Colors.gray(
      `[${new Date().toLocaleTimeString()}]`
    );

    const type = typeof object;
    const objectString: string = Colors.green(JSON.stringify(object, null, 2));

    console.log(`${currentTime} ${objectString} | Type: ${type}`);
  }

}


export default new Logger();
