import { Request, Response, NextFunction } from "express";
import { IJournal } from "../../shared/interfaces";
import { Journal } from "../../shared/models";
import {
  CoverCollector,
  ArticleCollector,
  JournalCollector,
} from "../../collectors";
import EscapeStringRegexp from "escape-string-regexp";

class JournalController {
  // Create a new journal (with cover and articles)
  public async addNewJournal(req: Request, res: Response, next: NextFunction) {
    try {
      const savedJournal: IJournal = await addJournalIfNotExists(req.body);
      return res.status(202).json(savedJournal);
    } catch (err) {
      return next(err);
    }
  }

  // Fetch newest articles of the journal with given ID
  public fetchNewestArticles(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;

    ArticleCollector.searchAndAddArticles(id)
      .then(() => {
        return res.status(200).json({ journalId: id });
      })
      .catch(next);
  }
}

/**
 * Add a journal to the database if it doesn't exist
 * Automatically search its cover
 * Automatically search its articles
 *
 * Only returns an error if the journal itself could not be added
 * If adding the cover or adding the articles failed, return an info object
 */
const addJournalIfNotExists = (
  journalData: any,
  autocomplete: boolean = true
): Promise<IJournal> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Need at least one identifier (issn or eissn)
      if (!journalData.issn || !journalData.eissn) {
        throw new Error("Must specify at least one identifier (issn or eissn)");
      }

      // Complete unspecified data (title, issn, eissn)
      if (
        autocomplete &&
        (!journalData.title || !journalData.issn || !journalData.eissn)
      ) {
        const searchTerm: string = journalData.eissn
          ? journalData.eissn
          : journalData.issn;

        if (!searchTerm.length) {
          throw new Error(
            "Journal details are not specified (need at least title, issn or eissn)"
          );
        }

        const searchResults: IJournal[] = await JournalCollector.searchJournals(
          searchTerm
        );
        const searchResult = searchResults[0];
        if (searchResult) {
          journalData.title = journalData.title
            ? journalData.title
            : searchResult.title;
          journalData.issn = journalData.issn
            ? journalData.issn
            : searchResult.issn;
          journalData.eissn = journalData.eissn
            ? journalData.eissn
            : searchResult.eissn;
        }
      }

      // Check if (completed) journal already exists
      let conditionsArray = [];
      if (journalData.issn) conditionsArray.push({ issn: journalData.issn });
      if (journalData.eissn) conditionsArray.push({ eissn: journalData.eissn });
      if (journalData.title) conditionsArray.push({ title: journalData.title });

      const condition = {
        $or: conditionsArray,
      };
      const duplicate: IJournal | null = await Journal.findOne(
        condition
      ).exec();
      if (duplicate) throw new Error("Journal already exists");

      // Save journal
      const journal: IJournal = new Journal(journalData);
      journal.save().then(async (savedJournal: IJournal) => {
        // Async cover search. If nothing is found, ignore
        CoverCollector.searchAndAddCover(journal._id).then().catch();
        // TODO: Queue article collection after adding journal
        //await ArticleCollector.searchAndAddArticles(journal._id).catch();
        return resolve(savedJournal);
      });
    } catch (err) {
      return reject(err);
    }
  });
};

const verifyIssn = (issn: string): boolean => {
  issn = EscapeStringRegexp(issn);
  const issnRegex: RegExp = /^[0-9]{4}-[0-9]{3}[0-9xX]$/;
  if (!issnRegex.test(issn)) return false;

  // Compute check digit
  // @ https://en.wikipedia.org/wiki/International_Standard_Serial_Number
  let sum: number = 0;
  let digitPosition: number = 8;
  for (const c of issn.split("").slice(0, 8)) {
    if (c === "-") continue;
    const digit: number = +c;
    sum += digit * digitPosition;
    --digitPosition;
  }
  const checkDigit: number = 11 - (sum % 11);
  let checkDigitString: string = checkDigit.toString();
  if (checkDigit === 10) {
    checkDigitString = "X";
  }

  return issn[8].toLowerCase() === checkDigitString.toLowerCase();
};

export default new JournalController();
