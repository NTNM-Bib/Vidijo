import ApiConfig from './api.config'
import Nodemailer, { TestAccount } from 'nodemailer'
import { Logger } from 'vidijo-lib'
import { IUser, IToken } from 'vidijo-lib/lib/interfaces'
import { Token } from 'vidijo-lib/lib/models'
import Crypto from 'crypto'
import Mustache from 'mustache'
import FS from 'fs'
import Juice from 'juice'

class Verification {
  private mailTransporter: any
  private usingEthereal: boolean = false
  private htmlMailTemplate: string

  constructor() {
    if (ApiConfig.NODE_ENV === 'production') {
      Logger.log('Setting up nodemailer for production...')
      this.setupNodemailerProduction()
    } else {
      Logger.log('Setting up nodemailer for development...')
      this.setupNodemailerEthereal()
    }

    // Get HTML verification mail template once
    this.htmlMailTemplate = FS.readFileSync(
      `${__dirname}/templates/verification-mail.template.mustache`,
      'utf-8'
    )
  }

  // Renders the Mustache template using the given information
  private htmlVerificationMail(
    firstName: string,
    vidijoURI: string,
    verificationLink: string
  ): string {
    const view: any = {
      firstName: firstName,
      verificationLink: verificationLink,
      vidijoURI: vidijoURI,
    }

    // Render mail template to an html string
    const rendered: string = Mustache.render(this.htmlMailTemplate, view)

    // Inline styles
    return Juice(rendered)
  }

  // Plain text verification mail
  private plainTextVerificationMail(
    firstName: string,
    verificationLink: string
  ): string {
    const lines: string[] = [
      `Hello, ${firstName}`,
      `Thank you for creating a new account at ${ApiConfig.VIDIJO_URI}`,
      'Please verify your email address by calling the link below.',
      '',
      `${verificationLink}`,
      '',
      'You can safely ignore this message if you did not create an account.',
    ]

    return lines.join('\n')
  }

  // This transporter uses Ethereal for testing
  private async setupNodemailerEthereal() {
    this.usingEthereal = true

    const testAccount: TestAccount = await Nodemailer.createTestAccount()

    this.mailTransporter = Nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    })
  }

  // Setup nodemailer for production
  private async setupNodemailerProduction() {
    this.usingEthereal = false

    const isSecure: boolean = ApiConfig.MAIL_PORT === 465

    this.mailTransporter = Nodemailer.createTransport({
      host: ApiConfig.MAIL_HOST,
      port: ApiConfig.MAIL_PORT,
      secure: isSecure,
      auth: {
        user: ApiConfig.MAIL_USERNAME,
        pass: ApiConfig.MAIL_PASSWORD,
      },
    })

    // Log mail configuration
    Logger.log(
      `Using mail configuration: host: ${ApiConfig.MAIL_HOST} , port: ${ApiConfig.MAIL_PORT}, smtps: ${isSecure}, username: ${ApiConfig.MAIL_USERNAME}`
    )
  }

  // Create a verification token in the database
  public async createVerificationToken(user: IUser): Promise<IToken> {
    const promise: Promise<IToken> = new Promise((resolve, reject) => {
      const token: IToken = new Token({
        user: user._id,
        token: Crypto.randomBytes(16).toString('hex'),
      })

      token
        .save()
        .then((token: IToken) => {
          return resolve(token)
        })
        .catch((err) => {
          return reject(err)
        })
    })

    return promise
  }

  // Send the Verification Mail
  public async sendVerificationMail(user: IUser, verificationLink: string) {
    const info = await this.mailTransporter.sendMail({
      from: `${ApiConfig.MAIL_SENDER_NAME}`,
      to: `"${user.firstName} ${user.secondName ? user.secondName : ''}" <${
        user.username
      }>`,
      subject: 'Vidijo | Verify your account',
      text: this.plainTextVerificationMail(user.firstName, verificationLink),
      html: this.htmlVerificationMail(
        user.firstName,
        ApiConfig.VIDIJO_URI,
        verificationLink
      ),
    })

    // When using Ethereal, the link to the message is printed to the console.
    if (this.usingEthereal) {
      Logger.log(`Message sent: ${info.messageId}`)
      Logger.log(`Preview available at: ${Nodemailer.getTestMessageUrl(info)}`)
    }
  }

  // Send the password reset mail containing a password reset link
  public async sendPasswordResetMail(user: IUser, passwordResetLink: string) {
    const info = await this.mailTransporter.sendMail({
      from: `${ApiConfig.MAIL_SENDER_NAME}`,
      to: `"${user.firstName} ${user.secondName ? user.secondName : ''}" <${
        user.username
      }>`,
      subject: 'Vidijo | Reset your password',
      text: `
            Hello, ${user.firstName}
            We received a password reset request from you. Visit the following link to change your password:
            ${passwordResetLink}
            This link is only valid for the next 24 hours.
            If you did not send this request, you can safely ignore this message and keep using your current password.
          `,
      //html: this.htmlPasswordResetMail(user.firstName, resetPasswordLink),
    })

    // When using Ethereal, the link to the message is printed to the console.
    if (this.usingEthereal) {
      Logger.log(`Message sent: ${info.messageId}`)
      Logger.log(`Preview available at: ${Nodemailer.getTestMessageUrl(info)}`)
    }
  }
}

export default new Verification()
