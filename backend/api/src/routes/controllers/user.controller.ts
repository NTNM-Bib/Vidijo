import ApiConfig from '../../api.config'
import { Request, Response, NextFunction } from 'express'
import { IUser } from '../../shared/interfaces'
import Axios from 'axios'
import CreateError from 'http-errors'

class UserController {
  // Get all users (admin only)
  public getUsers(req: Request, res: Response, next: NextFunction) {
    const currentlyLoggedInUser: any = req.user

    if (!currentlyLoggedInUser) {
      throw CreateError(401, `Nobody is currently logged in`)
    }

    // Convert parsed query back to string
    let query: string = '?'
    for (let key in req.query) {
      query += `${key}=${req.query[key]}&`
    }

    Axios.get(`${ApiConfig.USER_SERVICE_URI}/v1/users${query}`)
      .then((usersResponse) => {
        return res.json(usersResponse.data)
      })
      .catch(next)
  }

  // Get User with given ID (if ID is "me", return the currently logged in User)
  public getUser(req: Request, res: Response, next: NextFunction) {
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

    Axios.get(`${ApiConfig.USER_SERVICE_URI}/v1/users/${targetUserId}`)
      .then((userResponse) => {
        return res.json(userResponse.data)
      })
      .catch(next)
  }

  // Get the users (:id) favorite Journals
  public getFavoriteJournals(req: Request, res: Response, next: NextFunction) {
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

    // Convert parsed query back to string
    let query: string = '?'
    for (let key in req.query) {
      query += `${key}=${req.query[key]}&`
    }

    Axios.get(
      `${ApiConfig.USER_SERVICE_URI}/v1/users/${targetUserId}/favoriteJournals${query}`
    )
      .then((response) => {
        return res.json(response.data)
      })
      .catch(next)
  }

  // Add a journal to the users (:id) favorites
  public addFavoriteJournal(req: Request, res: Response, next: NextFunction) {
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

    Axios.post(
      `${ApiConfig.USER_SERVICE_URI}/v1/users/${targetUserId}/favoriteJournals/${journalId}`
    )
      .then((response) => {
        return res.json(response.data)
      })
      .catch(next)
  }

  // Remove a journal from the users (:id) favorites
  public removeFavoriteJournal(
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

    Axios.delete(
      `${ApiConfig.USER_SERVICE_URI}/v1/users/${targetUserId}/favoriteJournals/${journalId}`
    )
      .then((response) => {
        return res.json(response.data)
      })
      .catch(next)
  }

  // Get the users (:id) reading list
  public getReadingList(req: Request, res: Response, next: NextFunction) {
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

    // Convert parsed query back to string
    let query: string = '?'
    for (let key in req.query) {
      query += `${key}=${req.query[key]}&`
    }

    Axios.get(
      `${ApiConfig.USER_SERVICE_URI}/v1/users/${targetUserId}/readingList${query}`
    )
      .then((readingListPageResponse) => {
        return res.json(readingListPageResponse.data)
      })
      .catch(next)
  }

  // Add an article to the users (:id) reading list
  public addArticleToReadingList(
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

    Axios.post(
      `${ApiConfig.USER_SERVICE_URI}/v1/users/${targetUserId}/readingList/${articleId}`
    )
      .then((response) => {
        return res.json(response.data)
      })
      .catch(next)
  }

  // Remove an article from the users (:id) reading list
  public removeArticleFromReadingList(
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

    Axios.delete(
      `${ApiConfig.USER_SERVICE_URI}/v1/users/${targetUserId}/readingList/${articleId}`
    )
      .then((response) => {
        return res.json(response.data)
      })
      .catch(next)
  }

  // Update user data
  public patchUser(req: Request, res: Response, next: NextFunction) {
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

    Axios.patch(
      `${ApiConfig.USER_SERVICE_URI}/v1/users/${targetUserId}`,
      req.body
    )
      .then((response) => {
        return res.json(response.data)
      })
      .catch(next)
  }
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

export default new UserController()
