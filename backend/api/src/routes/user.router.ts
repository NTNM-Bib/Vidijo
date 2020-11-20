import { Router } from 'express'
import { UserController } from './controllers'
import * as Auth from '../auth'

const router: Router = Router()

// Admin Only: Get Users (with query) (admin only!)
router.get('/', Auth.isAdminUser, UserController.getUsers)

// Get the User with given id (if id is "me", return the currently logged in User)
router.get('/:id', UserController.getUser)

// Favorite Journals
router.get('/:id/favoriteJournals', UserController.getFavoriteJournals)

// Update user data (admin only!)
router.patch('/:id', Auth.isAdminUser, UserController.patchUser)

// Add a Journal to the users favorites
router.post(
  '/:id/favoriteJournals/:journalId',
  UserController.addFavoriteJournal
)

// Remove a journal from the users favorites
router.delete(
  '/:id/favoriteJournals/:journalId',
  UserController.removeFavoriteJournal
)

// Reading List
router.get('/:id/readingList', UserController.getReadingList)

// Add an Article to the Reading List
router.post(
  '/:id/readingList/:articleId',
  UserController.addArticleToReadingList
)

// Remove an Article from the Reading List
router.delete(
  '/:id/readingList/:articleId',
  UserController.removeArticleFromReadingList
)

export default router
