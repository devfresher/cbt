import express from "express"

const router = express.Router()
import * as resultController from "../controllers/resultController.js"

import { requireRole } from "../middleware/auth.js"

router.get("/", [requireRole(["Admin", "Staff", "Student"])], resultController.fetchAllResults)

export default router
