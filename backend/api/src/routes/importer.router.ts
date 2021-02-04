import { Router } from 'express'
import { ImporterController } from './controllers'
import * as Auth from '../auth'

const router: Router = Router()

// Upload the list of Vidijo data to this route
router.post('/xlsx', Auth.isAdminUser, ImporterController.importXLSX)

// Get the info to the uploaded xlsx file
router.post('/xlsx/info', Auth.isAdminUser, ImporterController.checkXLSX)

// GET a list of all uploaded .xlsx files
router.get('/xlsx/list', Auth.isAdminUser, ImporterController.getUploadedFiles)

export default router
