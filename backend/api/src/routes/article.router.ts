import { Router } from "express";
import { ArticleController } from "./controllers";

const router: Router = Router();

// GET articles
router.get("/", ArticleController.getArticles);

// GET an article by id
router.get("/:id", ArticleController.getArticleById);

export default router;
