import ApiConfig from '../../api.config'
import { Request, Response, NextFunction } from 'express'
import { IUser } from 'vidijo-lib/lib/interfaces'
import Axios from 'axios'
import CreateError from 'http-errors'
import { Logger } from 'vidijo-lib'
import EscapeStringRegexp from 'escape-string-regexp'
import { User, Journal, Article } from 'vidijo-lib/lib/models'

const MongoQueryString = require('mongo-querystring')
const MongoQS = new MongoQueryString()

// Get all users (admin only)
export function getUsers(req: Request, res: Response, next: NextFunction) {
  const currentlyLoggedInUser: any = req.user

  if (!currentlyLoggedInUser) {
    throw CreateError(401, `Nobody is currently logged in`)
  }

  const reqQuery: any = req.query

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
    searchQuery.$and.push({
      $or: [
        {
          username: {
            $regex: `\\b${searchTerm}`,
            $options: 'i',
          },
        },
        {
          firstName: {
            $regex: `\\b${searchTerm}`,
            $options: 'i',
          },
        },
        {
          secondName: {
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

  User.paginate(findQuery, paginationOptions)
    .then((usersPage: any) => res.json(usersPage))
    .catch(next)
}

// Get User with given ID (if ID is "me", return the currently logged in User)
export function getUser(req: Request, res: Response, next: NextFunction) {
  const currentlyLoggedInUser: any = req.user
  let targetUserId: string = req.params.id

  // Check if currently logged in user can edit the target user
  if (!canEdit(currentlyLoggedInUser, targetUserId)) {
    throw CreateError(
      401,
      `User ${currentlyLoggedInUser._id} is missing permissions to get user ${targetUserId}`
    )
  }

  if (targetUserId === 'me') {
    targetUserId = currentlyLoggedInUser._id
  }

  User.findById(targetUserId)
    .exec()
    .then((user: IUser | null) => {
      if (!user)
        throw CreateError(404, `User with ID ${targetUserId} does not exist`)

      return res.json(user)
    })
    .catch(next)
}

// Get the users (:id) favorite Journals
export function getFavoriteJournals(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const currentlyLoggedInUser: any = req.user as IUser
  let targetUserId: string = req.params.id

  console.log({ curr: currentlyLoggedInUser, targ: targetUserId })

  // Check if currently logged in user can edit the target user
  if (!canEdit(currentlyLoggedInUser, targetUserId)) {
    throw CreateError(
      401,
      `User ${currentlyLoggedInUser._id} is missing permissions to get favorite journals of user ${targetUserId}`
    )
  }

  if (targetUserId === 'me') {
    targetUserId = currentlyLoggedInUser._id
  }

  User.findById(targetUserId)
    .exec()
    .then((user) => {
      if (!user)
        throw CreateError(404, `User with ID ${targetUserId} does not exist`)

      return user
    })
    .then((user) => {
      let query: string = ''
      for (let key in req.query) {
        query += `${key}=${req.query[key]}&`
      }

      // Build query for favorite journals
      let idsString: string = ''
      for (let favoriteJournalId of user.favoriteJournals) {
        idsString += `_id[]=${favoriteJournalId}&`
      }

      // Prevent wrong results if there are no favorite journals
      idsString = idsString === '' ? '_id=!' : idsString

      return {
        query: query,
        favoriteJournalIds: idsString,
      }
    })
    .then((res) =>
      Axios.get(
        `${ApiConfig.API_URI}/v1/journals?${res.query}${res.favoriteJournalIds}`
      )
    )
    .then((response) => res.json(response.data))
    .catch(next)
}

// Add a journal to the users (:id) favorites
export function addFavoriteJournal(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const currentlyLoggedInUser: any = req.user
  const journalId: string = req.params.journalId
  let targetUserId: string = req.params.id

  // Check if currently logged in user can edit the target user
  if (!canEdit(currentlyLoggedInUser, targetUserId)) {
    throw CreateError(
      401,
      `User ${currentlyLoggedInUser._id} is missing permissions to edit user ${targetUserId}`
    )
  }

  if (targetUserId === 'me') {
    targetUserId = currentlyLoggedInUser._id
  }

  Journal.findById(journalId)
    .exec()
    .then((journal) => {
      if (!journal)
        throw CreateError(404, `Journal with ID ${journalId} does not exist`)

      return journal
    })
    .then((journal) => {
      const update = { $addToSet: { favoriteJournals: journal } }
      return update
    })
    .then((update) =>
      User.findByIdAndUpdate(targetUserId, update)
        .exec()
        .then((user) => {
          if (!user)
            throw CreateError(`User with ID ${targetUserId} does not exist`)
          return user
        })
    )
    .then((user) => res.json(user))
    .catch(next)
}

// Remove a journal from the users (:id) favorites
export function removeFavoriteJournal(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const currentlyLoggedInUser: any = req.user
  const journalId: string = req.params.journalId
  let targetUserId: string = req.params.id

  // Check if currently logged in user can edit the target user
  if (!canEdit(currentlyLoggedInUser, targetUserId)) {
    throw CreateError(
      401,
      `User ${currentlyLoggedInUser._id} is missing permissions to edit user ${targetUserId}`
    )
  }

  if (targetUserId === 'me') {
    targetUserId = currentlyLoggedInUser._id
  }

  const update = { $pull: { favoriteJournals: journalId } } as any

  User.findByIdAndUpdate(targetUserId, update)
    .exec()
    .then((user) => {
      if (!user) {
        throw CreateError(404, `User with id ${targetUserId} does not exist`)
      }

      return res.json(user)
    })
    .catch(next)
}

// Get the users (:id) reading list
export function getReadingList(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const currentlyLoggedInUser: any = req.user
  let targetUserId: string = req.params.id

  // Check if currently logged in user can edit the target user
  if (!canEdit(currentlyLoggedInUser, targetUserId)) {
    throw CreateError(
      401,
      `User ${currentlyLoggedInUser._id} is missing permissions to edit user ${targetUserId}`
    )
  }

  if (targetUserId === 'me') {
    targetUserId = currentlyLoggedInUser._id
  }

  User.findById(targetUserId)
    .exec()
    .then((user) => {
      if (!user)
        throw CreateError(404, `User with ID ${targetUserId} does not exist`)
      return user
    })
    .then((user) => {
      // Convert parsed query back to string
      let query: string = '?'
      for (let key in req.query) {
        query += `${key}=${req.query[key]}&`
      }

      // Build query for reading list articles
      let idsString: string = ''
      for (let readingListArticleId of user.readingList) {
        idsString += `_id[]=${readingListArticleId}&`
      }

      return Axios.get(
        `${ApiConfig.API_URI}/v1/articles?${query}${idsString}&populate=publishedIn&populateSelect=title`
      )
    })
    .then((response) => res.json(response.data))
    .catch(next)
}

// Add an article to the users (:id) reading list
export function addArticleToReadingList(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const currentlyLoggedInUser: any = req.user
  const articleId: string = req.params.articleId
  let targetUserId: string = req.params.id

  // Check if currently logged in user can edit the target user
  if (!canEdit(currentlyLoggedInUser, targetUserId)) {
    throw CreateError(
      401,
      `User ${currentlyLoggedInUser._id} is missing permissions to edit user ${targetUserId}`
    )
  }

  if (targetUserId === 'me') {
    targetUserId = currentlyLoggedInUser._id
  }

  Article.findById(articleId)
    .exec()
    .then((article) => {
      if (!article)
        throw CreateError(404, `Article with ID ${articleId} does not exist`)

      return article
    })
    .then((article) => {
      const update = { $addToSet: { readingList: article } }
      return update
    })
    .then((update) =>
      User.findByIdAndUpdate(targetUserId, update)
        .exec()
        .then((user) => {
          if (!user)
            throw CreateError(
              404,
              `User with ID ${targetUserId} does not exist`
            )
          return user
        })
    )
    .then((user) => res.json(user))
    .catch(next)
}

// Remove an article from the users (:id) reading list
export function removeArticleFromReadingList(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const currentlyLoggedInUser: any = req.user
  const articleId: string = req.params.articleId
  let targetUserId: string = req.params.id

  // Check if currently logged in user can edit the target user
  if (!canEdit(currentlyLoggedInUser, targetUserId)) {
    throw CreateError(
      401,
      `User ${currentlyLoggedInUser._id} is missing permissions to edit user ${targetUserId}`
    )
  }

  if (targetUserId === 'me') {
    targetUserId = currentlyLoggedInUser._id
  }

  const update = { $pull: { readingList: articleId } } as any

  User.findByIdAndUpdate(targetUserId, update)
    .exec()
    .then((user) => {
      if (!user) {
        throw CreateError(404, `User with ID ${targetUserId} does not exist`)
      }

      return res.json(user)
    })
    .catch(next)
}

// Update user data
export function patchUser(req: Request, res: Response, next: NextFunction) {
  const currentlyLoggedInUser: any = req.user
  let targetUserId: string = req.params.id

  // Check if currently logged in user can edit the target user
  if (!canEdit(currentlyLoggedInUser, targetUserId)) {
    throw CreateError(
      401,
      `User ${currentlyLoggedInUser._id} is missing permissions to edit user ${targetUserId}`
    )
  }

  if (targetUserId === 'me') {
    targetUserId = currentlyLoggedInUser._id
  }

  Promise.resolve(req.body)
    .then((update) => {
      if (update.accessLevel && update.accessLevel !== 'admin') {
        return User.find({
          accessLevel: 'admin',
        })
          .count()
          .exec()
          .then((numberOfAdminUsers: number) => {
            if (numberOfAdminUsers < 2)
              throw CreateError(
                400,
                'Cannot remove admin privileges from the only admin user'
              )

            return update
          })
      }

      return update
    })
    .then((update) =>
      User.findByIdAndUpdate(targetUserId, update)
        .exec()
        .then((user) => {
          if (!user)
            throw CreateError(
              404,
              `User with ID ${targetUserId} does not exist`
            )
          return user
        })
    )
    .then((user) => res.json(user))
    .catch(next)
}

// Returns true if the currently logged in user can edit the target user
function canEdit(currentlyLoggedInUser: IUser, targetUserId: string): boolean {
  if (!currentlyLoggedInUser) {
    return false
  }

  if (currentlyLoggedInUser.accessLevel === 'admin') {
    return true
  }

  if (targetUserId === 'me' || targetUserId === currentlyLoggedInUser._id) {
    return true
  }

  return false
}
