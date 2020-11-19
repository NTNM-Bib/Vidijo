/**
 * =-- External Data Service Config --=
 * IMPORTANT: THIS MUST BE THE FIRST IMPORT IN THE MAIN ENTRY SCRIPT FILE
 * Only relevant to this service
 * Extends DefaultConfig
 */

import { DefaultConfigClass } from './shared/default.config'

export class ExternalDataConfigClass extends DefaultConfigClass {
  public LOCAL_COVER_FOLDER: string = this.getLocalCoverFolder()
  public PUBLIC_COVER_URL: string = this.getPublicCoverFolderUrl()

  private getLocalCoverFolder(): string {
    if (!process.env.LOCAL_COVER_FOLDER) {
      const localCoverFolderMissingError: Error = new Error(
        "A destination folder for saving journal covers is not set in your .env file. Please set it with 'LOCAL_COVER_FOLDER=<your local cover folder>'"
      )
      console.error(localCoverFolderMissingError)
      throw localCoverFolderMissingError // this is a critical error that leads to a crash
    }

    return process.env.LOCAL_COVER_FOLDER
  }

  private getPublicCoverFolderUrl(): string {
    if (!process.env.PUBLIC_COVER_URL) {
      const publicCoverFolderUrlMissingError: Error = new Error(
        "Please provide the URL to the public cover folder in the .env file. You can set it with 'PUBLIC_COVER_URL=<your public cover folder url>'"
      )
      console.error(publicCoverFolderUrlMissingError)
      throw publicCoverFolderUrlMissingError // this is a critical error that leads to a crash
    }

    return process.env.PUBLIC_COVER_URL
  }
}

export default new ExternalDataConfigClass()
