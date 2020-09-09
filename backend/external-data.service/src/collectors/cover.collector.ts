import ExternalDataConfig from "../external-data.config"
import Axios, { AxiosResponse } from "axios"
import FS from "fs"
import Path from "path"
import { Journal } from "../shared/models"
import { Logger } from "../shared"
import { IJournal } from "../shared/interfaces"

const DomParser = require("dom-parser")
const ImageDownloader = require("image-downloader")

class CoverCollector {
  public async searchCoverUrl(journalIdentifier: string): Promise<string> {
    let promise: Promise<string> = new Promise(async (resolve, reject) => {
      const query: string = `http://www.journaltocs.ac.uk/index.php?action=tocs&issn=${journalIdentifier}`
      const response: AxiosResponse = await Axios.get(query).catch((err) => {
        return reject(err)
      })

      if (!response) {
        return reject(new Error(`searchAndAddArticlesPaginated: no response`))
      }

      const data = response.data
      if (!data) {
        return reject(new Error(`searchAndAddArticlesPaginated: no data`))
      }

      // Get cover url from received html
      try {
        const html = new DomParser().parseFromString(data.toString())

        const coverUrl = html
          .getElementById("column2Large")
          .getElementsByTagName("img")[0]
          .getAttribute("src")

        // Remove "No Journal Cover Available" Image
        if (coverUrl === "http://www.journaltocs.ac.uk/images/no_cover.jpg") {
          return reject(new Error(`No Cover found`))
        }

        Logger.debug(coverUrl)
        return resolve(coverUrl)
      } catch (err) {
        return reject(err)
      }
    })

    return promise
  }

  public async saveCoverToFileSystem(
    url: string,
    journalId: string
  ): Promise<string> {
    const promise: Promise<string> = new Promise((resolve, reject) => {
      // Cover folder (create if it doesn't exist)
      let destination = ExternalDataConfig.LOCAL_COVER_FOLDER
      const publicCoverUrl = ExternalDataConfig.PUBLIC_COVER_URL

      if (!FS.existsSync(destination)) {
        FS.mkdirSync(destination)
      }

      // Set name of the image to <journalId>.<extension>
      const fileExtension: string = Path.extname(url)
      destination += `/${journalId}${fileExtension}`

      const options = {
        url: url,
        dest: destination,
        extractFilename: false,
      }

      ImageDownloader.image(options)
        .then(({ filename, image }: any) => {
          const coverName: string = Path.basename(filename)
          return resolve(`${publicCoverUrl}/${coverName}`)
        })
        .catch((err: any) => {
          return reject(err)
        })
    })

    return promise
  }

  public async searchAndAddCover(journalId: string): Promise<IJournal> {
    let promise: Promise<IJournal> = new Promise(async (resolve, reject) => {
      // Get journal identifier
      const journal: IJournal | null = await Journal.findById(journalId)
        .exec()
        .catch((err) => {
          return reject(err)
        })
      if (!journal) {
        return reject(new Error(`searchCoverUrl: journal is null`))
      }
      let journalIdentifier: string
      try {
        journalIdentifier = journal.identifier
      } catch (err) {
        return reject(
          new Error(`searchCoverUrl: journal doesn't have an identifier`)
        )
      }

      // Search Cover URL
      const coverUrl: string = await this.searchCoverUrl(
        journalIdentifier
      ).catch((err) => {
        return reject(err)
      })

      Logger.debug(coverUrl)

      // Download cover
      const publicCoverUrl: string = await this.saveCoverToFileSystem(
        coverUrl,
        journalId
      ).catch((err) => {
        return reject(err)
      })

      journal
        .update({ cover: publicCoverUrl })
        .exec()
        .then((updatedJournal: IJournal) => {
          return resolve(updatedJournal)
        })
        .catch((err) => {
          return reject(err)
        })
    })

    return promise
  }
}

export default new CoverCollector()
