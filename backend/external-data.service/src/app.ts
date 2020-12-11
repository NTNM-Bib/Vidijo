import ExternalDataConfig from './external-data.config'
import Express from 'express'
import { Request, Response, NextFunction } from 'express'
import BodyParser from 'body-parser'
import CookieParser from 'cookie-parser'
import Cors from 'cors'
import Morgan from 'morgan'
import CreateError from 'http-errors'
import { JournalRouter, SearchRouter } from './routes'
import { Logger } from 'vidijo-lib'

class App {
  public app: Express.Application

  constructor() {
    this.app = Express()

    this.configureCookieParser()
    this.configureBodyParser()
    //this.configureCors()

    this.configureMorgan()

    // Router after logger!
    this.configureRoutes()

    this.configureErrorHandling()
  }

  private configureBodyParser() {
    this.app.use(BodyParser.json())
    this.app.use(BodyParser.urlencoded({ extended: false }))
  }

  private configureCookieParser() {
    this.app.use(CookieParser())
  }

  /*
  private configureCors() {
    const corsOptions = {
      credentials: true,
      origin: (origin: any, callback: any) => {
        callback(null, true)
      },
    }

    this.app.use(Cors(corsOptions))
  }
  */

  private configureRoutes() {
    this.app.use('/v1/journals', JournalRouter)
    this.app.use('/v1/search', SearchRouter)
  }

  private configureMorgan() {
    // Only use Morgan in development mode
    if (ExternalDataConfig.NODE_ENV !== 'development') {
      return
    }

    Morgan.token('body', (req: Request, res: Response) => {
      const body = JSON.stringify(req.body)
      return body === '{}' ? '' : body
    })

    /*
    this.app.use(
      Morgan(
        `${Colors.blue(':method')} :url ${Colors.yellow(
          ':status'
        )} :response-time ms - :res[content-length] ${Colors.green(':body')}`
      )
    )
    */
  }

  private configureErrorHandling() {
    function catch404(req: Request, res: Response, next: NextFunction) {
      return res.status(404).json(CreateError(404))
    }

    function errorHandler(
      err: CreateError.HttpError,
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      if (res.headersSent) return next(err)

      const statusCode = err.statusCode || 500
      const payload =
        statusCode === 500 ? CreateError(500, 'Internal server error') : err

      Logger.error(new Error(payload.stack || payload.message))

      return res.status(statusCode).json(payload)
    }

    this.app.use(errorHandler)
    this.app.use(catch404)
  }
}

export default new App().app
