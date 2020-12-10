import { Request, Response, NextFunction } from 'express'
import CreateError from 'http-errors'

// Check if the current user has access level "admin" (highest level)
export function isAdminUser(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    const user: any = req.user

    if (!user) {
      return next(CreateError(401, 'No user is attached to this request'))
    }

    const accessLevel: 'default' | 'admin' = user.accessLevel

    if (accessLevel === null) {
      return next(CreateError(401, 'Access level of this user is not set'))
    }

    user.checkAccessLevel(
      'admin',
      (err: Error, accessLevelHighEnough: boolean) => {
        if (err) {
          return next(err)
        }

        if (!accessLevelHighEnough) {
          return next(CreateError(401, 'Access level of this user is too low'))
        }

        return next()
      }
    )
  } else {
    return next(CreateError(401, 'User is not authenticated'))
  }
}

// Check if the current user has access level "default" or higher
export function isDefaultUser(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    const user: any = req.user

    if (!user) {
      return next(CreateError(401, 'No user is attached to this request'))
    }

    const accessLevel: 'default' | 'admin' = user.accessLevel

    if (accessLevel === null) {
      return next(CreateError(401, 'Access level of this user is not set'))
    }

    user.checkAccessLevel(
      'default',
      (err: Error, accessLevelHighEnough: boolean) => {
        if (err) {
          return next(err)
        }

        if (!accessLevelHighEnough) {
          return next(CreateError(401, 'Access level of this user is too low'))
        }

        return next()
      }
    )
  } else {
    return next(CreateError(401, 'User is not authenticated'))
  }
}
