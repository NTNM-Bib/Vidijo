import { Router } from 'express'
import { JournalController } from './controllers'

const router: Router = Router()

// POST a new journal and update
router.post('/', JournalController.addNewJournal)

// Fetch the newest articles of the journal with given ID
//router.put('/update/:id', JournalController.fetchNewestArticles)
router.put('/update/:id', JournalController.autoUpdateJournal)

export default router
