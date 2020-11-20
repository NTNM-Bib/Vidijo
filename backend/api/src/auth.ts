import { Request, Response, NextFunction } from 'express'
import Boom from '@hapi/boom'

// Check if the current user has access level "admin" (highest level)
export function isAdminUser(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    const user: any = req.user

    if (!user) {
      return next(Boom.unauthorized())
    }

    const accessLevel: 'default' | 'admin' = user.accessLevel

    if (accessLevel === null) {
      return next(Boom.unauthorized())
    }

    user.checkAccessLevel(
      'admin',
      (err: Error, accessLevelHighEnough: boolean) => {
        if (err) {
          return next(err)
        }

        if (!accessLevelHighEnough) {
          return next(Boom.unauthorized())
        }

        return next()
      }
    )
  } else {
    return next(Boom.unauthorized())
  }
}

// Check if the current user has access level "default" or higher
export function isDefaultUser(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    const user: any = req.user

    if (!user) {
      return next(Boom.unauthorized())
    }

    const accessLevel: 'default' | 'admin' = user.accessLevel

    if (accessLevel === null) {
      return next(Boom.unauthorized())
    }

    user.checkAccessLevel(
      'default',
      (err: Error, accessLevelHighEnough: boolean) => {
        if (err) {
          return next(err)
        }

        if (!accessLevelHighEnough) {
          return next(Boom.unauthorized())
        }

        return next()
      }
    )
  } else {
    return next(Boom.unauthorized())
  }
}
