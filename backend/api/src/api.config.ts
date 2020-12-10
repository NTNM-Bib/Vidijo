/**
 * =-- API Config --=
 * IMPORTANT: THIS MUST BE THE FIRST IMPORT IN THE MAIN ENTRY SCRIPT FILE
 * Only relevant to this service
 * Extends DefaultConfig
 */

import { DefaultConfigClass } from 'vidijo-lib'

export class ApiConfigClass extends DefaultConfigClass {
  public SESSION_SECRET: string = this.getSessionSecret()
  public MAIL_HOST: string = this.getMailHost()
  public MAIL_PORT: number = this.getMailPort()
  public MAIL_USERNAME: string = this.getMailUsername()
  public MAIL_PASSWORD: string = this.getMailPassword()
  public INSTITUTION_NAME: string = this.getInstitutionName()
  public INSTITUTION_LOGO_URI: string = this.getInstitutionLogoUri()
  public API_URI_HOSTED: string = this.getApiUriHosted()

  private getSessionSecret(): string {
    if (!process.env.SESSION_SECRET) {
      const sessionSecretMissingError: Error = new Error(
        'SESSION_SECRET is missing. Set this value to a long random string in the .env file (recommended length of 96 characters)'
      )
      console.error(sessionSecretMissingError)
      throw sessionSecretMissingError // this is a critical error that leads to a crash
    }

    return process.env.SESSION_SECRET
  }

  private getMailHost(): string {
    if (!process.env.MAIL_HOST) {
      const mailHostMissingError: Error = new Error(
        'MAIL_HOST is missing. Please provide the host address of your mail server for sending mails to users in the .env file (MAIL_HOST=<your mail host>)'
      )
      console.error(mailHostMissingError)
      throw mailHostMissingError // this is a critical error that leads to a crash
    }

    return process.env.MAIL_HOST
  }

  private getMailPort(): number {
    if (!process.env.MAIL_PORT) {
      console.warn(
        'MAIL_PORT not set in .env file. Using default SMTPS port 465 instead. If your want to change the port, add the following to the .env file: MAIL_PORT=<your port>'
      )
    }
    let mailPort: number = process.env.MAIL_PORT ? +process.env.MAIL_PORT : 465
    mailPort = isNaN(mailPort) ? 465 : mailPort

    return mailPort
  }

  private getMailUsername(): string {
    if (!process.env.MAIL_USERNAME) {
      const mailUsernameMissingError: Error = new Error(
        'MAIL_USERNAME is missing. Please provide the username of the mail account for sending mails to users in the .env file (MAIL_USERNAME=<your username>)'
      )
      console.error(mailUsernameMissingError)
      throw mailUsernameMissingError // this is a critical error that leads to a crash
    }

    return process.env.MAIL_USERNAME
  }

  private getMailPassword(): string {
    if (!process.env.MAIL_PASSWORD) {
      const mailPasswordMissingError: Error = new Error(
        'MAIL_PASSWORD is missing. Please provide the password of the mail account for sending mails to users in the .env file (MAIL_PASSWORD=<your password>)'
      )
      console.error(mailPasswordMissingError)
      throw mailPasswordMissingError // this is a critical error that leads to a crash
    }

    return process.env.MAIL_PASSWORD
  }

  private getInstitutionName(): string {
    if (!process.env.INSTITUTION_NAME) {
      const institutionNameMissingError: Error = new Error(
        "The name of your institution is not set in your .env file. Please set it with 'INSTITUTION_NAME=<your institution name>'"
      )
      console.error(institutionNameMissingError)
      throw institutionNameMissingError // this is a critical error that leads to a crash
    }

    return process.env.INSTITUTION_NAME
  }

  private getInstitutionLogoUri(): string {
    if (!process.env.INSTITUTION_LOGO_URI) {
      const institutionLogoUriMissingError: Error = new Error(
        "Please provide the URI to the institution logo in the .env file. You can set it with 'INSTITUTION_LOGO_URI=<your institution logo URI>'"
      )
      console.error(institutionLogoUriMissingError)
      throw institutionLogoUriMissingError // this is a critical error that leads to a crash
    }

    return process.env.INSTITUTION_LOGO_URI
  }

  private getApiUriHosted(): string {
    if (!process.env.API_URI_HOSTED) {
      const apiUriHostedMissingError: Error = new Error(
        "Please provide the URI to the hosted Vidijo-API in the .env file. You can set it with 'API_URI_HOSTED=<URI of hosted API>'"
      )
      console.error(apiUriHostedMissingError)
      throw apiUriHostedMissingError // this is a critical error that leads to a crash
    }

    return process.env.API_URI_HOSTED
  }
}

export default new ApiConfigClass()
