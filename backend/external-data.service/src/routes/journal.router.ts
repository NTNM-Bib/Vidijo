import { Router } from "express";
import { JournalController } from "./controllers";

const router: Router = Router();

// POST a new journal and update
router.post("/", JournalController.addNewJournal);

// POST a list of new journals and update
router.post("/bulk", JournalController.bulkAddNewJournals);

// Fetch the newest articles of the journal with given ID
router.put("/update/:id", JournalController.fetchNewestArticles);


export default router;
