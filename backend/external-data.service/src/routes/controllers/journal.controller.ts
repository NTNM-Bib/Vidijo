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

  // Add new journals in bulk
  public async bulkAddNewJournals(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const body = req.body;
    const journals: IJournal[] = body.map((value: IJournal) => {
      return new Journal(value);
    });

    for (let journal of journals) {
      await journal.save().catch((err: Error) => {
        return next(err);
      });

      await CoverCollector.searchAndAddCover(journal._id).catch(() => {});
      await ArticleCollector.searchAndAddArticles(journal._id).catch(() => {});
    }

    return res.status(200).json(journals);
  }

  // Fetch newest articles of the journal with given ID
  public async fetchNewestArticles(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const id = req.params.id;

    await ArticleCollector.searchAndAddArticles(id).catch((err: Error) => {
      return next(err);
    });

    return res.status(200).json({ journalId: id });
  }
}

// TODO: Test
/**
 * Add a journal to the database if it doesn't exist
 */
const addJournalIfNotExists = (
  journalData: any,
  autocomplete: boolean = true
): Promise<IJournal> => {
  const promise: Promise<IJournal> = new Promise(async (resolve, reject) => {
    // Need at least one identifier (issn or eissn)
    if (!journalData.issn || !journalData.eissn) {
      return reject(
        new Error("Must specify at least one identifier (issn or eissn)")
      );
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
        return reject(
          new Error(
            "Journal details are not specified (need at least title, issn or eissn)"
          )
        );
      }

      const searchResults: IJournal[] = await JournalCollector.searchJournals(
        searchTerm
      ).catch();
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
    const duplicate: IJournal | null = await Journal.findOne(condition)
      .exec()
      .catch();
    if (duplicate) return reject(new Error("Journal already exists"));

    // Save journal
    const journal: IJournal = new Journal(journalData);
    journal
      .save()
      .then(async (savedJournal: IJournal) => {
        await CoverCollector.searchAndAddCover(journal._id).catch();
        await ArticleCollector.searchAndAddArticles(journal._id).catch();

        return resolve(savedJournal);
      })
      .catch((err) => {
        return reject(err);
      });
  });

  return promise;
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
