import ApiConfig from './api.config'
import Express from 'express'
import { Request, Response, NextFunction } from 'express'
import BodyParser from 'body-parser'
import CookieParser from 'cookie-parser'
import Cors, { CorsOptions } from 'cors'
import ExpressSession from 'express-session'
import MongoDBStoreConnect from 'connect-mongodb-session'
import Passport from 'passport'
import PassportLocal from 'passport-local'
import Morgan from 'morgan'
import Colors from 'colors'
import Helmet from 'helmet'
import MustacheExpress from 'mustache-express'
import { User } from './shared/models'
import { IUser } from './shared/interfaces'
import {
  JournalRouter,
  ArticleRouter,
  SearchRouter,
  CategoryRouter,
  UserRouter,
  AuthRouter,
  PageRouter,
  ImporterRouter,
} from './routes'
import { Logger } from './shared'
import CreateError from 'http-errors'
import FileUpload from 'express-fileupload'

class App {
  public app: Express.Application

  // MongoDB session store.
  private sessionStore: any

  constructor() {
    this.app = Express()

    this.configureMustache()

    this.configureHelmet()

    this.configureCookieParser()
    this.configureBodyParser()
    this.configureCors()

    // Auth
    this.configureMongoDBSessionStore()
    this.configureExpressSession()
    this.configurePassport()

    this.configureMorgan()

    this.configureFileUpload()

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

  private configureMongoDBSessionStore() {
    const MongoDBStore = MongoDBStoreConnect(ExpressSession)

    this.sessionStore = new MongoDBStore({
      uri: ApiConfig.MONGODB_URI,
      collection: 'sessions',
    })

    this.sessionStore.on('error', (err: Error) => {
      throw err
    })
  }

  private configureExpressSession() {
    const sessionOptions: ExpressSession.SessionOptions = {
      secret: ApiConfig.SESSION_SECRET,
      resave: false,
      store: this.sessionStore,
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7, // miliseconds * seconds * minutes * hours * days
        sameSite: 'strict',
      },
      rolling: true, // Resets expiration date after each response
      saveUninitialized: false,
    }

    this.app.use(ExpressSession(sessionOptions))
  }

  private configurePassport() {
    const LocalStrategy = PassportLocal.Strategy
    Passport.use(
      new LocalStrategy((username: string, password: string, done: any) => {
        User.findOne({ username: username }, (err: Error, user: IUser) => {
          if (err) {
            return done(err)
          }

          if (!user) {
            return done(null, false)
          }

          user.verifyPassword(password, (err: Error, verified: boolean) => {
            if (err) {
              throw err
            }

            if (!verified) {
              return done(null, false)
            }

            return done(null, user)
          })
        })
      })
    )

    this.app.use(Passport.initialize())
    this.app.use(Passport.session())

    Passport.serializeUser((user: IUser, done) => {
      done(null, user._id)
    })

    Passport.deserializeUser(function (id, done) {
      User.findById(id, function (err: Error, user: IUser) {
        done(err, user)
      })
    })
  }

  private configureCors() {
    const corsOptions: CorsOptions = {
      credentials: true,
      origin: undefined,
    }

    this.app.use(Cors(corsOptions))
  }

  private configureRoutes() {
    this.app.use('/v1/pages', PageRouter)
    this.app.use('/v1/journals', JournalRouter)
    this.app.use('/v1/articles', ArticleRouter)
    this.app.use('/v1/search', SearchRouter)
    this.app.use('/v1/categories', CategoryRouter)
    this.app.use('/v1/users', UserRouter)
    this.app.use('/v1/auth', AuthRouter)
    this.app.use('/v1/import', ImporterRouter)
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

  private configureFileUpload() {
    this.app.use(
      FileUpload({
        createParentPath: true,
      })
    )
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
