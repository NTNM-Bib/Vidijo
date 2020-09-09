import { Router } from "express";
import { UserController } from "./controllers";

const router: Router = Router();

// Get Users (use query)
router.get("/", UserController.getUsers);

// Get the User with given id
router.get("/:id", UserController.getUser);

// Favorite Journals
router.get("/:id/favoriteJournals", UserController.getFavoriteJournals);

// Update user data
router.patch("/:id", UserController.patchUser);

// Add a Journal to the users favorites
router.post("/:id/favoriteJournals/:journalId", UserController.addFavoriteJournal);

// Remove a journal from the users favorites
router.delete("/:id/favoriteJournals/:journalId", UserController.removeFavoriteJournal);

// Reading List
router.get("/:id/readingList", UserController.getReadingList);

// Add an Article to the Reading List
router.post("/:id/readingList/:articleId", UserController.addArticleToReadingList);

// Remove an Article from the Reading List
router.delete("/:id/readingList/:articleId", UserController.removeArticleFromReadingList);


export default router;
