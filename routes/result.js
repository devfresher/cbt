import express from "express"

const router = express.Router()
import * as resultController from "../controllers/resultController.js"

import { requireRole } from "../middleware/auth.js"
import { validateQueryObjectIds } from "../middleware/validate.js"


router.get("/", [requireRole (['Admin', 'Staff', 'Student'])], resultController.fetchAllResults)
router.delete("/reset-result", [requireRole (['Admin', 'Staff']), validateQueryObjectIds(['studentId', 'assessmentId'])], resultController.resetStudentAssessment)


export default router