import express from "express"

const router = express.Router()

import * as subjectController from '../controllers/subjectController.js'
import * as assessmentController from "../controllers/assessmentController.js"
import { requireRole } from "../middleware/auth.js"
import { validateObjectId } from "../middleware/validate.js"

router.post("/:classId", [requireRole (['Admin']), validateObjectId('classId')], subjectController.createSubject)
router.get("/:classId", [requireRole (['Admin', 'Staff']), validateObjectId('classId')], subjectController.fetchAllByClass)
router.get("/:classId/:subjectId", [requireRole (['Admin', 'Staff']), validateObjectId('classId'), validateObjectId('subjectId')], subjectController.fetchById)
router.put("/:classId/:subjectId", [requireRole (['Admin', 'Staff']), validateObjectId('classId'), validateObjectId('subjectId')], subjectController.updateSubject)
router.delete("/:subjectId", [requireRole (['Admin', 'Staff']), validateObjectId('subjectId')], subjectController.deleteSubject)

// Assessment Implementation
router.post("/:subjectId/assessment", [requireRole (['Admin', 'Staff']), validateObjectId('subjectId')], assessmentController.createAssessment)
router.get("/:subjectId/assessment/:assessmentId", [requireRole (['Admin', 'Staff']), validateObjectId('subjectId')], assessmentController.fetchById)

// Questions Implementation
// router.post("/:subjectId/questions", [requireRole (['Admin', 'Staff']), validateObjectId('subjectId')], subjectController.createQuestion)
// router.get("/:subjectId/questions", [requireRole (['Admin', 'Staff']), validateObjectId('subjectId')], subjectController.fetchAllBySubject)
// router.get("/:subjectId/question/:questionId", [requireRole (['Admin', 'Staff']), validateObjectId('subjectId')], subjectController.getQuestionById)
// router.put("/:subjectId/question/:questionId", [requireRole (['Admin', 'Staff']), validateObjectId('subjectId')], subjectController.updateQuestion)
// router.delete("/:subjectId/question/:questionId", [requireRole (['Admin', 'Staff']), validateObjectId('subjectId')], subjectController.deleteQuestion)

export default router