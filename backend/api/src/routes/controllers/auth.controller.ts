import ApiConfig from '../../api.config'
import { Request, Response, NextFunction } from 'express'
import Passport from 'passport'
import Boom from '@hapi/boom'
import Verification from '../../verification'
import { IUser, IToken } from '../../shared/interfaces'
import { User, Token } from '../../shared/models'
import { v4 as UUIDv4 } from 'uuid'
import UUIDValidate from 'uuid-validate'

class AuthController {
  // Local: Login
  public localLogin(req: Request, res: Response, next: NextFunction) {
    Passport.authenticate('local', (err: Error, user: any, info: any) => {
      if (err) {
        return next(Boom.internal('Unexpected Authentication Error', err))
      }

      if (!user) {
        return next(Boom.unauthorized('Wrong username or password'))
      }

      req.logIn(user, (err: Error) => {
        if (err) {
          return next(Boom.unauthorized('Unexpected Login Error'))
        }

        if (!user.isVerified) {
          req.logOut()
          return next(
            Boom.unauthorized('This account has not been verified yet.')
          )
        }

        return res.status(200).json(user)
      })
    })(req, res, next)
  }

  // Local: Logout
  public localLogout(req: Request, res: Response, next: NextFunction) {
    req.logOut()
    res.status(200).clearCookie('connect.sid', {
      path: '/',
    })
    if (req.session) {
      req.session.destroy((err: Error) => {
        return res.status(200).json({})
      })
    } else {
      return res.status(200).json({})
    }
  }

  // Local: Register
  public localRegister(req: Request, res: Response, next: NextFunction) {
    // Check if this is the first user that will be created -> this is the admin
    User.estimatedDocumentCount()
      .exec()
      .then((numberOfCurrentUsers: number) => {
        // Create user
        let userToCreate: IUser = new User({
          username: req.body.username,
          password: req.body.password,
          firstName: req.body.firstName,
          secondName: req.body.secondName,
        } as IUser)

        if (numberOfCurrentUsers < 1) {
          userToCreate.accessLevel = 'admin'
        }

        // Save user in the database
        userToCreate
          .save()
          .then((createdUser: IUser) => {
            // Create verification token
            Verification.createVerificationToken(userToCreate)
              .then((verificationToken: IToken) => {
                // Send verification mail
                const verificationLink = `${ApiConfig.VIDIJO_URI}/account/verify/${verificationToken.token}`
                Verification.sendVerificationMail(createdUser, verificationLink)
                  .then(() => {
                    return res.status(201).json(createdUser)
                  })
                  .catch((err: Error) => {
                    return next(
                      Boom.conflict('Cannot send verification mail', err)
                    )
                  })
              })
              .catch((err: Error) => {
                return next(
                  Boom.conflict('Cannot create Verification Token', err)
                )
              })
          })
          .catch((err: Error) => {
            return next(Boom.conflict('User cannot be created', err))
          })
      })
      .catch((err: Error) => {
        return next(err)
      })
  }

  // Local: Verify
  public async localVerify(req: Request, res: Response, next: NextFunction) {
    const tokenString: string = req.body.token
    if (!tokenString) {
      return next(Boom.badRequest('token missing in request body'))
    }

    const token: IToken | null | void = await Token.findOne({
      token: tokenString,
    })
      .exec()
      .catch((err) => {
        return next(Boom.conflict('Token cannot be checked', err))
      })

    if (!token) {
      return next(Boom.notAcceptable('Invalid Authentication Token'))
    }

    // Account already verified
    if (token.isVerified) {
      return res.status(200).json({ alreadyVerified: true })
    }

    const user: IUser | null | void = await User.findByIdAndUpdate(token.user, {
      isVerified: true,
    })
      .exec()
      .catch((err) => {
        return next(
          Boom.conflict('User of Authentication Token cannot be checked', err)
        )
      })

    if (!user) {
      return next(
        Boom.notAcceptable('User of Authentication Token does not exist')
      )
    }

    token.isVerified = true
    token.save().catch((err) => {
      return next(Boom.conflict('Cannot modify authentication token', err))
    })

    return res.json({ success: true })
  }

  // Request password reset
  public async requestPasswordReset(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // Get mail from body
    const username: string = req.body.username
    if (!username) {
      return res
        .status(400)
        .json({ error: 'username not provided in the request body' })
    }

    // Check if username exists
    const user = await User.findOne({ username: username }).exec()
    if (!user) {
      return res.status(404).json({ error: 'this user does not exist' })
    }

    // Generate reset token and expiration date in the user model
    const passwordResetToken = UUIDv4()
    user.passwordResetToken = passwordResetToken
    user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 60 * 24)
    await user.save()

    const passwordResetLink: string = `${ApiConfig.VIDIJO_URI}/account/reset-password/${passwordResetToken}`

    // Send mail with reset link (vidijo.org/resetPassword/<token>)
    Verification.sendPasswordResetMail(user, passwordResetLink)

    return res
      .status(200)
      .json({ success: `a password reset email was sent to ${username}` })
  }

  // Reset password
  public async resetPassword(req: Request, res: Response, next: NextFunction) {
    // Get new password from body
    const resetToken: string = req.body.token
    const password: string = req.body.password

    if (!UUIDValidate(resetToken, 4))
      return res.status(400).json({ error: 'invalid reset token' })

    if (!password) return res.status(400).json({ error: 'password missing' })

    // Get user where reset token matches the token in the body
    const user = await User.findOne({ passwordResetToken: resetToken }).exec()
    if (!user) {
      return res.status(400).json({ error: 'invalid reset token' })
    }

    // Check if token has not yet expired
    const expirationDate: Date = user.passwordResetExpires
    if (expirationDate < new Date()) {
      return res.status(400).json({ error: 'reset token expired' })
    }

    // Store new password in the user (hashed on save)
    user.password = password
    // Expire stored reset token
    user.passwordResetExpires = new Date()
    await user.save().catch((_) => {
      return res.status(400).json({ error: 'cannot change password' })
    })

    return res
      .status(200)
      .json({ success: 'new password was set successfully ' })
  }

  // Preview Verification Mail
  public previewVerificationMail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.render('verification-mail.template.mustache', {
      firstName: 'Thomas',
      verificationLink: 'https://www.vidijo.org',
    })
  }

  // Preview Verification Complete Page
  public previewVerificationComplete(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.render('verification-complete.template.mustache')
  }

  // Preview already verified page
  public previewAlreadyVerified(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.render('verification-already-verified.template.mustache')
  }
}

export default new AuthController()
