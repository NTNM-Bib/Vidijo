import { Router } from 'express'
import { SearchController } from './controllers'

const router: Router = Router()

/**
 * Search for journals in DOAJ
 * Return all journals that where found, even the ones that are already in the database
 */
router.get('/journals', SearchController.searchJournals)

/**
 * Search for journals in DOAJ
 * Return an object with available and already installed journals
 */
router.get('/journals-partitioned', SearchController.searchJournalsPartitioned)

export default router
