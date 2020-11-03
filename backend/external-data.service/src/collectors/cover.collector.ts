import ExternalDataConfig from "../external-data.config";
import Axios, { AxiosResponse } from "axios";
import FS from "fs";
import Path from "path";
import { Journal } from "../shared/models";
import { IJournal } from "../shared/interfaces";
import { Logger } from "../shared";

const DomParser = require("dom-parser");
const ImageDownloader = require("image-downloader");

/**
 * Try to find a URL to a cover of the given journal
 * Currently the image is retrieved from journaltocs.ac.uk
 *
 * @param journalIdentifier pISSN or eISSN of the journal
 */
export const searchCoverUrl = (journalIdentifier: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const query: string = `http://www.journaltocs.ac.uk/index.php?action=tocs&issn=${journalIdentifier}`;
      const response: AxiosResponse = await Axios.get(query);

      const data = response.data;
      if (!data) {
        throw new Error(`Response does not contain a data attribute`);
      }

      // Get cover url from received html
      const html = new DomParser().parseFromString(data.toString());

      const coverUrl = html
        .getElementById("column2Large")
        .getElementsByTagName("img")[0]
        .getAttribute("src");

      // Remove "No Journal Cover Available" Image
      if (coverUrl === "http://www.journaltocs.ac.uk/images/no_cover.jpg") {
        throw new Error(
          `Cover for journal with identifier ${journalIdentifier} cannot be found`
        );
      }

      return resolve(coverUrl);
    } catch (err) {
      return reject(err);
    }
  });
};

export const saveCoverToFileSystem = (
  url: string,
  journalId: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Cover folder (create if it doesn't exist)
      let destination = ExternalDataConfig.LOCAL_COVER_FOLDER;
      const publicCoverUrl = ExternalDataConfig.PUBLIC_COVER_URL;

      if (!FS.existsSync(destination)) {
        FS.mkdirSync(destination);
      }

      // Set name of the image to <journalId>.<extension>
      const fileExtension: string = Path.extname(url);
      destination += `/${journalId}${fileExtension}`;

      const options = {
        url: url,
        dest: destination,
        extractFilename: false,
      };

      ImageDownloader.image(options).then(({ filename, image }: any) => {
        const coverName: string = Path.basename(filename);
        return resolve(`${publicCoverUrl}/${coverName}`);
      });
    } catch (err) {
      return reject(err);
    }
  });
};

/**
 * Try to find a cover for the given journal.
 * Save it to the file system.
 * Assign the cover to the journal.
 */
export const searchAndAddCover = (journalId: string): Promise<IJournal> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get journal identifier
      const journal: IJournal | null = await Journal.findById(journalId).exec();
      if (!journal)
        throw new Error(
          `Cannot find the journal with ID ${journalId} and thus not update its cover`
        );

      // Search cover URL
      const coverUrl: string = await searchCoverUrl(journal.identifier);

      // Download cover
      const publicCoverUrl: string = await saveCoverToFileSystem(
        "" + coverUrl,
        journalId
      );

      const updatedJournal: IJournal | null = await Journal.updateOne(
        { id: journalId },
        {
          cover: publicCoverUrl,
        }
      ).exec();

      if (!updatedJournal)
        throw new Error(
          `Cannot find the journal with ID ${journalId} and thus not update its cover`
        );

      return resolve(updatedJournal);
    } catch (err) {
      return reject(err);
    }
  });
};
