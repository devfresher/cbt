import express from "express"

const router = express.Router()
import * as assessmentController from "../controllers/assessmentController.js"

import { requireRole } from "../middleware/auth.js"
import { isSubjectTeacher } from "../middleware/subject.js"
import { validateObjectIds } from "../middleware/validate.js"

router.post("/start", requireRole (['Student']), assessmentController.startAssessment)
router.post("/complete", requireRole (['Student']), assessmentController.completeAssessment)

// Assessment Implementation
router.post("/", [requireRole (['Admin', 'Staff']), isSubjectTeacher], assessmentController.createAssessment)
router.get("/", [requireRole (['Admin'])], assessmentController.fetchAllAssessment)
router.get("/taken", [requireRole (['Admin'])], assessmentController.fetchAllAssessmentTaken)
router.get("/:subjectId", [requireRole (['Admin', 'Staff']), validateObjectIds('subjectId')], assessmentController.fetchAllBySubject)
router.get("/:subjectId/:assessmentId", [requireRole (['Admin', 'Staff']), validateObjectIds(['subjectId', 'assessmentId'])], assessmentController.fetchById)

router.patch("/:assessmentId/release-result", [requireRole (['Admin']), validateObjectIds('assessmentId')], assessmentController.updateAssessment)
router.put("/:assessmentId", [requireRole (['Admin', 'Staff']), validateObjectIds('assessmentId'), isSubjectTeacher], assessmentController.updateAssessment)
router.delete("/:assessmentId", [requireRole (['Admin', 'Staff']), validateObjectIds('assessmentId'), isSubjectTeacher], assessmentController.deleteAssessment)

export default router