import { Router } from "express";
import { PageController } from "./controllers";


const router: Router = Router();

// Get aggregated home page data
router.get("/home", PageController.getHomePage);

// Get aggregated discover page data
router.get("/discover", PageController.getDiscoverPage);

// Get aggregated journals page data
router.get("/journals", PageController.getJournalsPage);

// Get aggregated categories page data
router.get("/categories", PageController.getCategoriesPage);

// Get aggregated search page data
router.get("/search", PageController.getSearchPage);

export default router;
