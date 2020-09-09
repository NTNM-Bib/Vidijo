import { Router } from "express";
import { JournalController } from "./controllers";
import * as Auth from "../auth";

const router: Router = Router();

// GET all journals (articles are not included)
router.get("/", JournalController.getJournals);

// Create a new journal
router.post("/", Auth.isAdminUser, JournalController.createJournal);

// TODO: Journal bulk update
router.put("/", Auth.isAdminUser);

// DELETE all journals
router.delete("/", Auth.isAdminUser);

// GET a journal (articles are not included)
router.get("/:id", JournalController.getJournal);

// TODO: PUT new journal data
router.put("/:id", Auth.isAdminUser);

// DELETE a journal
router.delete("/:id", Auth.isAdminUser, JournalController.deleteJournal);

// PATCH a journal
router.patch("/:id", Auth.isAdminUser, JournalController.patchJournal);

// TODO: Create a new article in the given journal
router.post("/:id/articles", Auth.isAdminUser);

// GET all articles of the journal with given id
router.get("/:id/articles", JournalController.getArticles);

// TODO: Bulk update of all articles in this journal
router.put("/:id/articles", Auth.isAdminUser);

// TODO: DELETE all articles of the given journal
router.delete("/:id/articles", Auth.isAdminUser);

export default router;
