import { Router } from 'express'
import { SearchController } from './controllers'
import * as Auth from '../auth'

const router: Router = Router()

// Search journals in 3rd party services
router.get('/', Auth.isAdminUser, SearchController.searchJournals)

export default router
