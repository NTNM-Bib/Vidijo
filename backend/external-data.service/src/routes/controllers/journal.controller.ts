import { Request, Response, NextFunction } from "express";
import { IJournal } from "../../shared/interfaces";
import { Journal } from "../../shared/models";
import {
  CoverCollector,
  ArticleCollector,
  JournalCollector,
} from "../../collectors";
import CreateError from "http-errors";

class JournalController {
  // Create a new journal (with cover and articles)
  public addNewJournal(req: Request, res: Response, next: NextFunction) {
    const journal = req.body;

    addJournalIfNotExists(journal)
      .then((savedJournal) => {
        return res.status(202).json(savedJournal);
      })
      .catch(next);
  }

  // Fetch newest articles of the journal with given ID
  public fetchNewestArticles(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;

    ArticleCollector.searchAndAddArticles(id)
      .then(() => {
        return res.json({ journalId: id });
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
) =>
  Promise.resolve(journalData)
    // Data integrity check
    .then((data: any) => {
      if (!(journalData.issn || journalData.eissn))
        throw CreateError(
          422,
          "Must specify at least one identifier (issn or eissn)"
        );

      return data;
    })
    // Verify ISSN and eISSN
    .then((data) => {
      if (data.issn && !verifyIssn(data.issn))
        throw CreateError(422, `ISSN ${data.issn} is invalid`);
      if (data.eissn && !verifyIssn(data.eissn))
        throw CreateError(422, `eISSN ${data.eissn} is invalid`);

      return new Journal(data);
    })
    // Autocomplete journal
    .then((journal: IJournal) => {
      if (!autocomplete) return journal;

      const searchTerm = journal.eissn || journal.issn;
      return JournalCollector.searchJournals(searchTerm)
        .then((results) => {
          const result = results[0];
          journal.title = journal.title || result.title;
          journal.issn = journal.issn || result.issn;
          journal.eissn = journal.eissn || result.eissn;
          return journal;
        })
        .catch((err) => {
          return journal; // Ignore if autocompletion failed
        });
    })
    // Check if journal already exists
    .then((journal: IJournal) => {
      let conditionsArray = [];
      if (journal.issn) conditionsArray.push({ issn: journal.issn });
      if (journal.eissn) conditionsArray.push({ eissn: journal.eissn });
      if (journal.title) conditionsArray.push({ title: journal.title });

      const condition = {
        $or: conditionsArray,
      };

      return Journal.findOne(condition)
        .exec()
        .then((duplicate: IJournal | null) => {
          if (duplicate)
            throw CreateError(
              400,
              `Journal ${journal} already exists in the database`
            );

          return journal;
        })
        .catch((err) => {
          throw CreateError(
            500,
            `Cannot check for duplicate of journal ${journal}`
          );
        });
    })
    // Save journal in the database
    .then((journal: IJournal) => {
      return journal
        .save()
        .then((savedJournal) => {
          return savedJournal;
        })
        .catch((err) => {
          throw CreateError(
            500,
            `Cannot save journal ${journal} to the database`
          );
        });
    })
    // TODO: Search articles and cover
    .then((journal) => {
      return Promise.allSettled([
        ArticleCollector.searchAndAddArticles(journal._id),
        // CoverCollector.searchAndAddCover(journal._id),
      ])
        .then((results) => {
          return journal;
        })
        .catch((err) => {
          throw CreateError(
            `Something went wrong when adding articles and cover of the journal ${journal}`
          );
        });
    })
    .catch((err) => {
      throw err;
    });

/**
 * Verify the format and check digit of the entered ISSN.
 * @param issn ISSN (pISSN or eISSN to verify)
 */
const verifyIssn = (issn: string): boolean => {
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
