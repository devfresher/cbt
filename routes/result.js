import express from "express"

const router = express.Router()
import * as resultController from "../controllers/resultController.js"

import { requireRole } from "../middleware/auth.js"
import { validateObjectIds } from "../middleware/validate.js"


router.get("/", [requireRole (['Admin', 'Staff', 'Student']), validateObjectIds('subjectId')], resultController.fetchAllResults)


export default router