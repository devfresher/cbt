import express from "express"

const router = express.Router()
import * as assessmentController from "../controllers/assessmentController.js"

import { requireRole } from "../middleware/auth.js"
import { validateObjectIds } from "../middleware/validate.js"

router.post("/start", requireRole (['Student']), assessmentController.startAssessment)

// Assessment Implementation
router.post("/", [requireRole (['Admin', 'Staff'])], assessmentController.createAssessment)
router.get("/:subjectId", [requireRole (['Admin', 'Staff']), validateObjectIds('subjectId')], assessmentController.fetchAllBySubject)
router.get("/:subjectId/:assessmentId", [requireRole (['Admin', 'Staff']), validateObjectIds(['subjectId', 'assessmentId'])], assessmentController.fetchById)

router.put("/:assessmentId", [requireRole (['Admin', 'Staff']), validateObjectIds('assessmentId')], assessmentController.updateAssessment)
router.delete("/:assessmentId", [requireRole (['Admin', 'Staff']), validateObjectIds('assessmentId')], assessmentController.deleteAssessment)



export default router