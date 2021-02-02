import ExternalDataConfig from '../external-data.config'
import Axios from 'axios'
import FS from 'fs'
import { Journal } from 'vidijo-lib/lib/models'
import { Logger } from 'vidijo-lib'
import { IJournal } from 'vidijo-lib/lib/interfaces'

const DomParser = require('dom-parser')
const ImageDownloader = require('image-downloader')

/**
 * Try to find a URL to a cover of the given journal
 * Currently the image is retrieved from journaltocs.ac.uk
 *
 * @param journalIdentifier pISSN or eISSN of the journal
 */
export const searchCoverUrl = (journalIdentifier: string) => {
  const query = `http://www.journaltocs.ac.uk/index.php?action=tocs&issn=${journalIdentifier}`

  return (
    Axios.get(query)
      // Search for a cover on journaltocs.ac.uk
      .then((response) => {
        if (!response.data) throw new Error('Response does not contain data')
        return response.data
      })
      // Parse HTML from received data
      .then((data) => new DomParser().parseFromString(data.toString()))
      // Extract the cover src from the HTML
      .then(
        (html) =>
          html
            .getElementById('column2Large')
            .getElementsByTagName('img')[0]
            .getAttribute('src') as string
      )
      // Check if the cover src is the one of the "no cover" image
      .then((url) => {
        if (url === 'http://www.journaltocs.ac.uk/images/no_cover.jpg')
          throw new Error(
            `Cover for journal with identifier ${journalIdentifier} cannot be found`
          )

        return url
      })
      .catch((err) => {
        throw err
      })
  )
}

/**
 * Download a journal cover from the given URL and name it correctly
 *
 * @param url the url to download the cover from
 * @param journalId the journal the cover belongs to
 */
export const saveCoverToFileSystem = (url: string, journalId: string) =>
  Promise.resolve(ExternalDataConfig.LOCAL_COVER_FOLDER)
    // Create the local folder if it does not exist
    .then((destination) => {
      if (!FS.existsSync(destination)) {
        FS.mkdirSync(destination)
      }

      return destination
    })
    // Complete the path with file name and extension
    .then((destination) => {
      return destination + `/${journalId}` // save without extension
    })
    .then((path) => {
      const options = {
        url: url,
        dest: path,
        extractFilename: false,
      }

      return options
    })
    .then((options) => {
      Logger.log(
        `Attempting download from ${options.url} to ${options.dest}...`
      )
      return ImageDownloader.image(options)
    })
    .then(() => {
      Logger.log(`Cover downloaded successfully`)
    })
    .catch((err) => {
      throw err
    })

/**
 * Try to find a cover for the given journal
 * Save it to the file system
 *
 * @param journalId The ID of the journal to get a cover for
 */
export const searchAndAddCover = (journalId: string) =>
  Journal.findById(journalId)
    .exec()
    // Check if journal to search a cover for exists
    .then((journal: IJournal) => {
      if (!journal)
        throw new Error(
          `Cannot find the journal with ID ${journalId} and thus not update its cover`
        )
      return journal
    })
    .then((journal: IJournal) => {
      Logger.log(`Trying to find a cover for journal ${journal.title}...`)
      return journal
    })
    // Search the cover URL and save it to the FS
    .then((journal: IJournal) =>
      searchCoverUrl(journal.identifier)
        // Upgrade URL to https if necessary
        .then((url) => {
          Logger.log(`Found a cover at ${url}`)

          if (!url.startsWith('https')) {
            url = url.replace('http', 'https')
          }

          return url
        })
        .then((url) => {
          // Add information about the cover source
          journal.update({ coverUrl: url, coverDate: new Date() }).exec()
          return url
        })
        .then((url) => saveCoverToFileSystem(url, journalId).then())
    )
    .catch((err: any) => {
      Logger.log(`Cannot get a cover for ${journalId}: ${err}`)
      throw err
    })
