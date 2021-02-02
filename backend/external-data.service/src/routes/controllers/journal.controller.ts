import { Request, Response, NextFunction } from 'express'
import { IJournal } from 'vidijo-lib/lib/interfaces'
import { Journal } from 'vidijo-lib/lib/models'
import {
  CoverCollector,
  ArticleCollector,
  JournalCollector,
} from '../../collectors'
import CreateError from 'http-errors'
import { promises } from 'fs'

// Create a new journal (with cover and articles)
export function addNewJournal(req: Request, res: Response, next: NextFunction) {
  const journal = req.body

  addJournalIfNotExists(journal)
    .then((savedJournal) => res.status(202).json(savedJournal))
    .catch(next)
}

// Fetch newest articles of the journal with given ID
export function fetchNewestArticles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id: string = req.params.id

  ArticleCollector.searchAndAddArticles(id)
    .then(() => res.json({ journalId: id }))
    .catch(next)
}

export function autoUpdateJournal(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id: string = req.params.id
  Journal.findById(id)
    .exec()
    .then((journal: IJournal | null) => {
      if (!journal)
        throw new Error(`Cannot update journal ${id} since it doesn't exist`)

      return journal
    })
    .then((journal: IJournal) => {
      let promises = [ArticleCollector.searchAndAddArticles(id)]
      if (!journal.coverUrl || !journal.coverUrl.length) {
        promises.push(CoverCollector.searchAndAddCover(id))
      }

      return Promise.allSettled(promises)
    })
    .then((_: any) => res.json({ journalId: id }))
    .catch(next)
}

/**
 * Add a journal to the database if it doesn't exist
 * Automatically search its cover
 * Automatically search its articles
 *
 * Only returns an error if the journal itself could not be added
 * If adding the cover or adding the articles failed, return an info object
 */
export const addJournalIfNotExists = (
  journalData: any,
  autocomplete: boolean = true,
  shouldVerifyIssn: boolean = false
) =>
  Promise.resolve(journalData)
    // Data integrity check
    .then((data: any) => {
      if (!(journalData.issn || journalData.eissn))
        throw CreateError(
          422,
          'Must specify at least one identifier (issn or eissn)'
        )

      return data
    })
    // Verify ISSN and eISSN
    .then((data) => {
      if (shouldVerifyIssn && data.issn && !verifyIssn(data.issn))
        throw CreateError(422, `ISSN ${data.issn} is invalid`)
      if (shouldVerifyIssn && data.eissn && !verifyIssn(data.eissn))
        throw CreateError(422, `eISSN ${data.eissn} is invalid`)

      return new Journal(data)
    })
    // Autocomplete journal
    .then((journal: IJournal) => {
      if (!autocomplete) return journal

      const searchTerm = journal.eissn ?? journal.issn
      return JournalCollector.searchJournals(searchTerm)
        .then((results) => {
          const result = results[0]
          journal.title = journal.title ?? result.title
          journal.issn = journal.issn ?? result.issn
          journal.eissn = journal.eissn ?? result.eissn
          journal.added = new Date()
          return journal
        })
        .catch((err) => {
          return journal // Ignore if autocompletion failed
        })
    })
    // Check if journal already exists
    .then((journal: IJournal) => {
      let conditionsArray = []
      if (journal.issn) conditionsArray.push({ issn: journal.issn })
      if (journal.eissn) conditionsArray.push({ eissn: journal.eissn })
      if (journal.title) conditionsArray.push({ title: journal.title })

      const condition = {
        $or: conditionsArray,
      }

      return Journal.findOne(condition)
        .exec()
        .then((duplicate: IJournal | null) => {
          if (duplicate)
            throw CreateError(
              400,
              `Journal ${journal} already exists in the database`
            )

          return journal
        })
        .catch((err: any) => {
          throw CreateError(
            500,
            `Cannot check for duplicate of journal ${journal}`
          )
        })
    })
    // Save journal in the database
    .then((journal: IJournal) => {
      return journal.save().catch((err) => {
        throw CreateError(500, `Cannot save journal ${journal} to the database`)
      })
    })
    // Search the newest 100 articles and a cover
    .then((journal) => {
      return Promise.allSettled([
        ArticleCollector.searchAndAddArticlesPaginated(
          journal._id,
          journal.identifier,
          100,
          1
        ),
        CoverCollector.searchAndAddCover(journal._id),
      ])
        .then((_) => journal)
        .catch((err) => {
          throw CreateError(
            `Something went wrong when adding articles and cover of the journal ${journal}: ${err}`
          )
        })
    })
    .catch((err) => {
      throw err
    })

/**
 * Verify the format and check digit of the entered ISSN.
 * @param issn ISSN (pISSN or eISSN to verify)
 */
export function verifyIssn(issn: string): boolean {
  const issnRegex: RegExp = /^[0-9]{4}-[0-9]{3}[0-9xX]$/
  if (!issnRegex.test(issn)) return false

  // Compute check digit
  // @ https://en.wikipedia.org/wiki/International_Standard_Serial_Number
  let sum: number = 0
  let digitPosition: number = 8
  for (const c of issn.split('').slice(0, 8)) {
    if (c === '-') continue
    const digit: number = +c
    sum += digit * digitPosition
    --digitPosition
  }
  const checkDigit: number = 11 - (sum % 11)
  let checkDigitString: string = checkDigit.toString()
  if (checkDigit === 10) {
    checkDigitString = 'X'
  }

  return issn[8].toLowerCase() === checkDigitString.toLowerCase()
}
