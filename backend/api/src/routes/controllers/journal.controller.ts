import ApiConfig from '../../api.config'
import { Request, Response, NextFunction } from 'express'
import { IJournal, IArticle } from '../../shared/interfaces'
import { Journal, Article } from '../../shared/models'
import Axios from 'axios'
import EscapeStringRegexp from 'escape-string-regexp'
import Logger from '../../shared/logger'
import CreateError from 'http-errors'
import Path from 'path'

const MongoQueryString = require('mongo-querystring')
const MongoQS = new MongoQueryString({
  custom: {
    after: 'added',
    before: 'added',
    between: 'added',
  },
})

// Create a new journal
// When created, search its cover
// Also search and add articles
export function createJournal(req: Request, res: Response, next: NextFunction) {
  Axios.post(`${ApiConfig.EXTERNAL_DATA_SERVICE_URI}/v1/journals`, req.body)
    .then(() => {
      return res.json({ created: true })
    })
    .catch(next)
}

// Get journals using a query string
export function getJournals(req: Request, res: Response, next: NextFunction) {
  let reqQuery: any = req.query

  // Remove sorting, limit, selection, population & search from the query
  let sort: string = reqQuery.sort ? reqQuery.sort : ''
  reqQuery.sort = undefined

  const DEFAULT_LIMIT: number = 50
  let limit: number = reqQuery.limit ? +reqQuery.limit : DEFAULT_LIMIT
  limit = limit > DEFAULT_LIMIT ? DEFAULT_LIMIT : limit
  reqQuery.limit = undefined

  let select: string = reqQuery.select ? reqQuery.select : ''
  reqQuery.select = undefined

  let populate: string = reqQuery.populate ? reqQuery.populate : ''
  reqQuery.populate = undefined

  let populateSelect: string = reqQuery.populateSelect
    ? reqQuery.populateSelect
    : ''
  reqQuery.populateSelect = undefined

  let page: number = reqQuery.page ? reqQuery.page : 1
  reqQuery.page = undefined

  let search: string = reqQuery.search ? reqQuery.search : ''
  reqQuery.search = undefined

  // Parse find conditions from remaining query
  let findQuery = MongoQS.parse(reqQuery)
  Logger.debug(findQuery)

  // Build search query for multiple search terms
  let searchTerms: string[] = search.split(' ')
  let searchQuery = {
    $and: [] as any[],
  }

  for (let searchTerm of searchTerms) {
    searchTerm = EscapeStringRegexp(searchTerm)
    console.log(searchTerm)
    searchQuery.$and.push({
      $or: [
        {
          title: {
            $regex: `\\b${searchTerm}`,
            $options: 'i',
          },
        },
        {
          issn: {
            $regex: `\\b${searchTerm}`,
            $options: 'i',
          },
        },
        {
          eissn: {
            $regex: `\\b${searchTerm}`,
            $options: 'i',
          },
        },
      ],
    } as any)
  }

  // Change findQuery if query contains "search"
  if (search && search !== '') {
    findQuery = {
      $and: [findQuery, searchQuery],
    }
  }

  // Execute
  const paginationOptions = {
    populate: { path: populate, select: populateSelect },
    select: select,
    sort: sort,
    collation: { locale: 'en' },
    limit: limit,
    page: page,
  }

  Journal.paginate(findQuery, paginationOptions)
    .then((journalsPage: any) => {
      return res.json(journalsPage)
    })
    .catch(next)
}

// Get a journal by its id
export function getJournal(req: Request, res: Response, next: NextFunction) {
  const id: string = req.params.id

  Journal.findOne({ _id: id })
    .exec()
    .then((journal: IJournal | null) => {
      if (!journal) {
        throw CreateError(404, `Journal with ID ${id} does not exist`)
      }
      journal.incViews()
      return res.json(journal)
    })
    .catch(next)
}

// PATCH journal entity with given id
export function patchJournal(req: Request, res: Response, next: NextFunction) {
  const id: string = req.params.id
  const update = req.body

  Journal.findByIdAndUpdate(id, update)
    .exec()
    .then((patchedJournal: IJournal | null) => {
      if (!patchedJournal) {
        throw CreateError(404, `Journal with ID ${id} does not exist`)
      }
      return res.json(patchedJournal)
    })
    .catch(next)
}

// DELETE a journal by its ID
// Also remove all articles from this journal
export function deleteJournal(req: Request, res: Response, next: NextFunction) {
  const journalId: string = req.params.id

  Promise.all([
    Journal.findByIdAndDelete(journalId).exec(),
    Article.deleteMany({ publishedIn: journalId }).exec(),
  ])
    .then(() => {
      return res.json({ deleted: journalId })
    })
    .catch(next)
}

// Get articles of a journal by its id
export function getArticles(req: Request, res: Response, next: NextFunction) {
  const id: string = req.params.id

  Article.find({ publishedIn: id })
    .sort('+pubdate')
    .exec()
    .then((articles: IArticle[] | null) => {
      if (!articles) {
        throw CreateError(
          404,
          `Journal with ID ${id} does not contain any articles`
        )
      }
      return res.json(articles)
    })
    .catch(next)
}

/**
 * Upload a new cover for the journal with given ID
 * @param req
 * @param res
 * @param next
 */
export function uploadNewCover(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = req.params.id

  Promise.resolve()
    .then(() => {
      if (!req.files) {
        throw CreateError(400, 'No file was attached to this request')
      }
      return req.files
    })
    .then((files) => {
      if (!files.cover) {
        throw CreateError(
          400,
          'Cannot find a new cover file attached to this request'
        )
      }
      return files.cover
    })
    .then((coverFile) => {
      if (!coverFile.mimetype.startsWith('image'))
        throw CreateError(
          400,
          `You must upload a file with mime type image/*. You uploaded ${coverFile.mimetype}`
        )
      return coverFile
    })
    .then((coverFile) => {
      const coverPath = Path.normalize(`/var/vidijo/covers/${id}`)
      return coverFile.mv(coverPath).then(() => {
        return res.json({ success: true })
      })
    })
    .catch(next)
}
