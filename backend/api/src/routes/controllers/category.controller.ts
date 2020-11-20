import { Request, Response, NextFunction } from 'express'
import EscapeStringRegexp from 'escape-string-regexp'
import { Category } from '../../shared/models'
import { ICategory } from '../../shared/interfaces'
import Logger from '../../shared/logger'
import CreateError from 'http-errors'

const MongoQueryString = require('mongo-querystring')
const MongoQS = new MongoQueryString()

class CategoryController {
  // GET /categories
  public getCategories(req: Request, res: Response, next: NextFunction) {
    let reqQuery: any = req.query

    // Remove sorting, limit and selection from find query
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
      searchQuery.$and.push({
        title: {
          $regex: `\\b${searchTerm}`,
          $options: 'i',
        },
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

    Category.paginate(findQuery, paginationOptions)
      .then((categoriesPage: any) => {
        return res.json(categoriesPage)
      })
      .catch(next)
  }

  // GET /category/:id
  public getCategory(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id

    Category.findOne({ _id: id })
      .exec()
      .then((category: ICategory | null) => {
        if (!category) {
          throw CreateError(404, `Category with ID ${id} does not exist`)
        }
        return res.json(category)
      })
      .catch(next)
  }

  // POST /category
  public createCategory(req: Request, res: Response, next: NextFunction) {
    const body = req.body
    const category: ICategory = new Category(body)

    category
      .save()
      .then((savedCategory: ICategory) => {
        return res.json(savedCategory)
      })
      .catch(next)
  }

  // PUT /category
  public patchCategory(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id
    const update = req.body

    Category.findByIdAndUpdate(id, update)
      .exec()
      .then((patchedCategory: ICategory | null) => {
        if (!patchedCategory) {
          throw CreateError(404, `Category with ID ${id} does not exist`)
        }
        return res.json(patchedCategory)
      })
      .catch(next)
  }

  // DELETE /category
  // TODO: Remove category ID from all journals
  public deleteCategory(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id

    Category.deleteOne({ _id: id })
      .exec()
      .then((result) => {
        return res.json(result)
      })
      .catch(next)
  }
}

export default new CategoryController()
