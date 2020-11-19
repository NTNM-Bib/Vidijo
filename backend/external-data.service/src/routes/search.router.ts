import { Router } from 'express'
import { SearchController } from './controllers'

const router: Router = Router()

// Search journals in 3rd party services
router.get('/journals', SearchController.searchJournals)

export default router
