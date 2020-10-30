import ExternalDataConfig from "./external-data.config";

import Express from "express";
import { Request, Response, NextFunction } from "express";
import BodyParser from "body-parser";
import CookieParser from "cookie-parser";
import Cors from "cors";
import Morgan from "morgan";
import Colors from "colors";
import Boom from "@hapi/boom";

import { JournalRouter, ArticleRouter, SearchRouter } from "./routes";

class App {
  public app: Express.Application;

  constructor() {
    this.app = Express();

    this.configureCookieParser();
    this.configureBodyParser();
    this.configureCors();

    this.configureMorgan();

    // Router after logger!
    this.configureRoutes();

    this.configureErrorHandling();
  }

  private configureBodyParser() {
    this.app.use(BodyParser.json());
    this.app.use(BodyParser.urlencoded({ extended: false }));
  }

  private configureCookieParser() {
    this.app.use(CookieParser());
  }

  private configureCors() {
    const corsOptions = {
      credentials: true,
      origin: (origin: any, callback: any) => {
        callback(null, true);
      },
    };

    this.app.use(Cors(corsOptions));
  }

  private configureRoutes() {
    this.app.use("/v1/journals", JournalRouter);
    this.app.use("/v1/articles", ArticleRouter);
    this.app.use("/v1/search", SearchRouter);
  }

  private configureMorgan() {
    // Only use Morgan in development mode
    if (ExternalDataConfig.NODE_ENV !== "development") {
      return;
    }

    Morgan.token("body", (req: Request, res: Response) => {
      const body = JSON.stringify(req.body);
      return body === "{}" ? "" : body;
    });

    this.app.use(
      Morgan(
        `${Colors.blue(":method")} :url ${Colors.yellow(
          ":status"
        )} :response-time ms - :res[content-length] ${Colors.green(":body")}`
      )
    );
  }

  private configureErrorHandling() {
    // Boom Errors
    this.app.use(
      (err: any, req: Request, res: Response, next: NextFunction) => {
        if (err.isServer) {
          // TODO: Don't show specific internal errors to user
          return next();
        }

        return res.status(err.output.statusCode).json(err.output.payload);
      }
    );

    // Server Errors
    this.app.use(
      (err: any, req: Request, res: Response, next: NextFunction) => {
        return res.status(500).json({
          statusCode: 500,
          error: err,
          message: "Internal Server Error",
        });
      }
    );
  }
}

export default new App().app;
