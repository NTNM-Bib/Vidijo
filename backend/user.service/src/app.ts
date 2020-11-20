import ApiConfig from './user.config'

import Express from 'express'
import { Request, Response, NextFunction } from 'express'
import BodyParser from 'body-parser'
import CookieParser from 'cookie-parser'
import Cors from 'cors'
import Morgan from 'morgan'
import Colors from 'colors'
import Helmet from 'helmet'
import MustacheExpress from 'mustache-express'

import { UserRouter } from './routes'

class App {
  public app: Express.Application

  constructor() {
    this.app = Express()

    this.configureMustache()

    this.configureHelmet()

    this.configureCookieParser()
    this.configureBodyParser()
    this.configureCors()

    this.configureMorgan()

    // Router after logger!
    this.configureRoutes()

    this.configureErrorHandling()
  }

  private configureMustache() {
    this.app.engine('mustache', MustacheExpress())

    this.app.set('view engine', 'mustache')
    this.app.set('views', `${__dirname}/templates`)

    this.app.disable('view cache')
  }

  private configureHelmet() {
    this.app.use(Helmet())
  }

  private configureBodyParser() {
    this.app.use(BodyParser.json())
    this.app.use(BodyParser.urlencoded({ extended: false }))
  }

  private configureCookieParser() {
    this.app.use(CookieParser())
  }

  private configureCors() {
    const corsOptions = {
      credentials: true,
      origin: (origin: any, callback: any) => {
        callback(null, true)
      },
    }

    this.app.use(Cors(corsOptions))
  }

  private configureRoutes() {
    this.app.use('/v1/users', UserRouter)
  }

  private configureMorgan() {
    // Only use Morgan in development mode
    if (ApiConfig.NODE_ENV !== 'development') {
      return
    }

    Morgan.token('body', (req: Request, res: Response) => {
      const body = JSON.stringify(req.body)
      return body === '{}' ? '' : body
    })

    this.app.use(
      Morgan(
        `${Colors.blue(':method')} :url ${Colors.yellow(
          ':status'
        )} :response-time ms - :res[content-length] ${Colors.green(':body')}`
      )
    )
  }

  private configureErrorHandling() {
    // Boom Errors
    this.app.use(
      (err: any, req: Request, res: Response, next: NextFunction) => {
        if (err.isServer) {
          // TODO: Don't show specific internal errors to user
          return next()
        }

        return res.status(err.output.statusCode).json(err.output.payload)
      }
    )

    // Server Errors
    this.app.use(
      (err: any, req: Request, res: Response, next: NextFunction) => {
        return res.status(500).json({
          statusCode: 500,
          error: err,
          message: 'Internal Server Error',
        })
      }
    )
  }
}

export default new App().app
