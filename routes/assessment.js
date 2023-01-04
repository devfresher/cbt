import express from "express"

const router = express.Router()
import * as assessmentController from "../controllers/assessmentController.js"

import { requireRole } from "../middleware/auth.js"
import { validateObjectIds } from "../middleware/validate.js"

// Assessment Implementation
router.post("/:subjectId", [requireRole (['Admin', 'Staff']), validateObjectIds('subjectId')], assessmentController.createAssessment)
router.get("/:subjectId", [requireRole (['Admin', 'Staff']), validateObjectIds('subjectId')], assessmentController.fetchAllBySubject)
router.get("/:subjectId/:assessmentId", [requireRole (['Admin', 'Staff']), validateObjectIds(['subjectId', 'assessmentId'])], assessmentController.fetchById)

router.put("/:subjectId/:assessmentId", [requireRole (['Admin', 'Staff']), validateObjectIds(['subjectId', 'assessmentId'])], assessmentController.updateAssessment)
router.delete("/:assessmentId", [requireRole (['Admin', 'Staff']), validateObjectIds('assessmentId')], assessmentController.deleteAssessment)

export default router