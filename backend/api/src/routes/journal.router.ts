import { Router } from 'express'
import { JournalController } from './controllers'
import * as Auth from '../auth'

const router: Router = Router()

// GET all journals (articles are not included)
router.get('/', JournalController.getJournals)

// Create a new journal
router.post('/', Auth.isAdminUser, JournalController.createJournal)

// GET a journal (articles are not included)
router.get('/:id', JournalController.getJournal)

// DELETE a journal
router.delete('/:id', Auth.isAdminUser, JournalController.deleteJournal)

// PATCH a journal
router.patch('/:id', Auth.isAdminUser, JournalController.patchJournal)

// GET all articles of the journal with given id
router.get('/:id/articles', JournalController.getArticles)

// PUT a new journal cover
router.put('/:id/cover', Auth.isAdminUser, JournalController.uploadNewCover)

export default router
