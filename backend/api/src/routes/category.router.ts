import { Router } from 'express'
import { CategoryController } from './controllers'
import * as Auth from '../auth'

const router: Router = Router()

// GET all categories
router.get('/', CategoryController.getCategories)

// GET the categories with given ID
router.get('/:id', CategoryController.getCategory)

// Create a new categories
router.post('/', Auth.isAdminUser, CategoryController.createCategory)

// Patch the categories with given ID
router.patch('/:id', Auth.isAdminUser, CategoryController.patchCategory)

// Delete the categories with given ID
router.delete('/:id', Auth.isAdminUser, CategoryController.deleteCategory)

export default router
