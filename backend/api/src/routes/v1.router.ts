import { Router } from "express";
import { V1Controller } from "./controllers";

const router: Router = Router();

// Return information about v1 of the API
router.get("/", V1Controller.about);


export default router;
