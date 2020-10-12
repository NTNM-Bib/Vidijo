import { Router } from "express";
import { ImporterController } from "./controllers";
import * as Auth from "../auth";

const router: Router = Router();

// Import XLSX
router.post("/xlsx", Auth.isAdminUser, ImporterController.importXLSX);

export default router;
